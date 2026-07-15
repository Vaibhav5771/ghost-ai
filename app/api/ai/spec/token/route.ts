import { auth as clerkAuth } from "@clerk/nextjs/server";
import { auth } from "@trigger.dev/sdk/v3";

import { prisma } from "@/lib/prisma";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const { userId } = await clerkAuth();
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

  const { runId } = body as { runId?: unknown };
  if (typeof runId !== "string" || !runId.trim()) {
    return jsonError("runId is required", 400);
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId: runId.trim() },
  });

  if (!taskRun || taskRun.userId !== userId) {
    return jsonError("Not found", 404);
  }

  const token = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [runId.trim()],
      },
    },
    expirationTime: "1h",
  });

  return Response.json({ token });
}
