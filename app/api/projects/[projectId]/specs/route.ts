import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectForUser } from "@/lib/project-access";

type SpecsRouteContext = {
  params: Promise<{ projectId: string }>;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(_request: Request, { params }: SpecsRouteContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId } = await params;

  const project = await getProjectForUser(
    projectId,
    identity.userId,
    identity.primaryEmail,
  );
  if (!project) return jsonError("Not found", 404);

  const rows = await prisma.projectSpec.findMany({
    where: { projectId },
    select: { id: true, createdAt: true, filePath: true },
    orderBy: { createdAt: "desc" },
  });

  const specs = rows.map((s: { id: string; createdAt: Date; filePath: string }) => ({
    id: s.id,
    createdAt: s.createdAt,
    filename: s.filePath.split("/").pop() ?? `spec-${s.id}.md`,
  }));

  return Response.json({ specs });
}
