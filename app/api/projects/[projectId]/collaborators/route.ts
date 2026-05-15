import { auth, clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";

interface CollaboratorRow {
  id: string;
  email: string;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function getAuthenticatedUserId() {
  const { userId } = await auth();
  return userId;
}

async function getUserEmails(userId: string): Promise<string[]> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return user.emailAddresses
    .map((e) => e.emailAddress.toLowerCase())
    .filter(Boolean);
}

async function findProjectOwner(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
}

const CLERK_MAX_PAGE_SIZE = 500;

function normalizeCollaboratorEmail(email: string): string {
  return email.toLowerCase().trim();
}

async function enrichCollaborators(rows: CollaboratorRow[]) {
  if (rows.length === 0) return [];

  const clerk = await clerkClient();
  const emails = rows.map((r) => normalizeCollaboratorEmail(r.email));

  type ClerkUser = {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    emailAddresses: Array<{ emailAddress: string }>;
  };
  const userByEmail = new Map<string, ClerkUser>();

  for (let i = 0; i < emails.length; i += CLERK_MAX_PAGE_SIZE) {
    const chunk = emails.slice(i, i + CLERK_MAX_PAGE_SIZE);
    const result = await clerk.users.getUserList({
      emailAddress: chunk,
      limit: chunk.length,
    });
    for (const u of result.data) {
      for (const e of u.emailAddresses) {
        const normalized = normalizeCollaboratorEmail(e.emailAddress);
        if (!userByEmail.has(normalized)) {
          userByEmail.set(normalized, u);
        }
      }
    }
  }

  return rows.map((row) => {
    const user = userByEmail.get(normalizeCollaboratorEmail(row.email));
    const name = user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      : null;
    const avatarUrl = user?.imageUrl ?? null;
    return { id: row.id, email: row.email, name, avatarUrl };
  });
}

async function parseEmailBody(request: Request): Promise<string | null> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return null;
  }
  if (!body || typeof body !== "object" || !("email" in body)) return null;
  const { email } = body as { email?: unknown };
  return typeof email === "string" ? email.trim().toLowerCase() || null : null;
}

type CollaboratorsRouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(
  _request: Request,
  { params }: CollaboratorsRouteContext
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { projectId } = await params;
  const userEmails = await getUserEmails(userId);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { collaborators: { some: { email: { in: userEmails } } } },
      ],
    },
    select: { ownerId: true },
  });

  if (!project) return jsonError("Not found", 404);

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  const collaborators = await enrichCollaborators(rows);
  return Response.json({ collaborators });
}

export async function POST(
  request: Request,
  { params }: CollaboratorsRouteContext
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { projectId } = await params;
  const project = await findProjectOwner(projectId);
  if (!project || project.ownerId !== userId) return jsonError("Forbidden", 403);

  const email = await parseEmailBody(request);
  if (!email) return jsonError("Email is required", 400);

  let row: CollaboratorRow;
  try {
    row = await prisma.projectCollaborator.create({
      data: { projectId, email },
      select: { id: true, email: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return jsonError("Already a collaborator", 409);
    }
    throw err;
  }

  const [collaborator] = await enrichCollaborators([row]);
  return Response.json({ collaborator }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: CollaboratorsRouteContext
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const { projectId } = await params;
  const project = await findProjectOwner(projectId);
  if (!project || project.ownerId !== userId) return jsonError("Forbidden", 403);

  const email = await parseEmailBody(request);
  if (!email) return jsonError("Email is required", 400);

  await prisma.projectCollaborator.deleteMany({
    where: { projectId, email },
  });

  return Response.json({ email });
}
