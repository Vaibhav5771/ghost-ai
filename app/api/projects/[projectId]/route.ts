import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

const projectSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  canvasBlobUrl: true,
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

async function readRenameProjectBody(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return null;
  }

  if (!body || typeof body !== "object" || !("name" in body)) {
    return null;
  }

  const { name } = body as { name?: unknown };
  const normalizedName = typeof name === "string" ? name.trim() : "";

  return normalizedName || null;
}

async function findProjectOwner(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
}

type ProjectRouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function PATCH(request: Request, { params }: ProjectRouteContext) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await params;
  const project = await findProjectOwner(projectId);

  if (!project || project.ownerId !== userId) {
    return jsonError("Forbidden", 403);
  }

  const name = await readRenameProjectBody(request);

  if (!name) {
    return jsonError("Project name is required", 400);
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { name },
    select: projectSelect,
  });

  return Response.json({ project: updatedProject });
}

export async function DELETE(_request: Request, { params }: ProjectRouteContext) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await params;
  const project = await findProjectOwner(projectId);

  if (!project || project.ownerId !== userId) {
    return jsonError("Forbidden", 403);
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return Response.json({ projectId });
}
