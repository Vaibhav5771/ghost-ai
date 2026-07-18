import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk/v3";

import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectForUser } from "@/lib/project-access";
import { generateSpecTask } from "@/trigger/generate-spec";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  if (!body || typeof body !== "object") {
    return jsonError("Invalid request body", 400);
  }

  const { roomId, chatHistory, nodes, edges } = body as {
    roomId?: unknown;
    chatHistory?: unknown;
    nodes?: unknown;
    edges?: unknown;
  };

  if (typeof roomId !== "string" || !roomId.trim()) {
    return jsonError("roomId is required", 400);
  }

  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  // roomId === projectId in this codebase — resolve project to verify access
  const project = await getProjectForUser(roomId.trim(), identity.userId, identity.primaryEmail);
  if (!project) return jsonError("Not found", 404);

  const handle = await generateSpecTask.trigger({
    projectId: project.id,
    projectName: project.name,
    roomId: roomId.trim(),
    chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
    nodes: Array.isArray(nodes) ? nodes : [],
    edges: Array.isArray(edges) ? edges : [],
  });

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId,
    },
  });

  const publicToken = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [handle.id] } },
    expirationTime: "1h",
  });

  return Response.json({ runId: handle.id, publicToken }, { status: 201 });
}
