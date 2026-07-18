import { del } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectForUser } from "@/lib/project-access";

type SpecRouteContext = {
  params: Promise<{ projectId: string; specId: string }>;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function DELETE(_request: Request, { params }: SpecRouteContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId, specId } = await params;

  const project = await getProjectForUser(
    projectId,
    identity.userId,
    identity.primaryEmail,
  );
  if (!project) return jsonError("Not found", 404);

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
    select: { id: true, projectId: true, filePath: true },
  });

  if (!spec || spec.projectId !== projectId) {
    return jsonError("Not found", 404);
  }

  await prisma.projectSpec.delete({ where: { id: specId } });

  try {
    await del(spec.filePath);
  } catch {
    // blob deletion is best-effort; DB record is already gone
  }

  return new Response(null, { status: 204 });
}
