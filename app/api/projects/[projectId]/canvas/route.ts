import { get, put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectForUser } from "@/lib/project-access";

type CanvasRouteContext = {
  params: Promise<{ projectId: string }>;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function PUT(request: Request, { params }: CanvasRouteContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId } = await params;
  const project = await getProjectForUser(
    projectId,
    identity.userId,
    identity.primaryEmail,
  );
  if (!project) return jsonError("Forbidden", 403);

  let canvasJson: unknown;
  try {
    canvasJson = await request.json();
  } catch {
    return jsonError("Invalid canvas JSON", 400);
  }

  const body = JSON.stringify(canvasJson);
  // Private store — the raw URL is not fetchable without the read-write token,
  // so reads go through the @vercel/blob SDK on the server (see GET below).
  // Stable pathname per project + allowOverwrite keeps a single snapshot in the
  // store; addRandomSuffix must be false so that pathname stays predictable.
  const blob = await put(`projects/${projectId}/canvas.json`, body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasBlobUrl: blob.url },
  });

  return Response.json({ url: blob.url });
}

export async function GET(_request: Request, { params }: CanvasRouteContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId } = await params;
  const project = await getProjectForUser(
    projectId,
    identity.userId,
    identity.primaryEmail,
  );
  if (!project) return jsonError("Forbidden", 403);

  const record = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasBlobUrl: true },
  });

  if (!record?.canvasBlobUrl) {
    return Response.json({ canvas: null });
  }

  // Private blobs require SDK-authenticated reads — a bare fetch(url) returns
  // 401 from the CDN because the URL is only meaningful to the token owner.
  const result = await get(record.canvasBlobUrl, {
    access: "private",
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    return Response.json({ canvas: null });
  }

  const text = await new Response(result.stream).text();
  const canvas = JSON.parse(text);
  return Response.json({ canvas });
}
