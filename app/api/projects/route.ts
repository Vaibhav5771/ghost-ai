import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";
const INITIAL_CANVAS_JSON_PATH = "";

const projectSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  canvasJsonPath: true,
  createdAt: true,
  updatedAt: true,
} as const;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function getAuthenticatedUserId() {
  const { userId } = await auth();
  return userId;
}

async function readCreateProjectBody(request: Request) {
  if (!request.body) {
    return { name: DEFAULT_PROJECT_NAME, id: null };
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { name: DEFAULT_PROJECT_NAME, id: null };
  }

  if (!body || typeof body !== "object" || !("name" in body)) {
    return { name: DEFAULT_PROJECT_NAME, id: null };
  }

  const { id, name } = body as { id?: unknown; name?: unknown };
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedId = typeof id === "string" ? id.trim() : "";
  const projectId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedId) ? normalizedId : null;

  return { name: normalizedName || DEFAULT_PROJECT_NAME, id: projectId };
}

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: projectSelect,
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  const { id, name } = await readCreateProjectBody(request);

  const project = await prisma.project.create({
    data: {
      ...(id ? { id } : {}),
      ownerId: userId,
      name,
      canvasJsonPath: INITIAL_CANVAS_JSON_PATH,
    },
    select: projectSelect,
  });

  return Response.json({ project }, { status: 201 });
}
