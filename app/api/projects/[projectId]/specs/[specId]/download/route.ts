import { get } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectForUser } from "@/lib/project-access";

type DownloadRouteContext = {
  params: Promise<{ projectId: string; specId: string }>;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(_request: Request, { params }: DownloadRouteContext) {
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

  const result = await get(spec.filePath, {
    access: "private",
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    return jsonError("Spec file not available", 404);
  }

  const text = await new Response(result.stream).text();

  return new Response(text, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
    },
  });
}
