import { type NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { liveblocks, getCursorColor } from "@/lib/liveblocks";
import { getCurrentIdentity, getProjectForUser } from "@/lib/project-access";

export async function POST(req: NextRequest) {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  // Liveblocks client sends the room ID as `room` in the request body.
  const projectId: unknown = body?.room ?? body?.projectId;
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const project = await getProjectForUser(
    projectId,
    identity.userId,
    identity.primaryEmail
  );
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await currentUser();
  const displayName =
    user?.fullName ??
    user?.username ??
    identity.primaryEmail ??
    identity.userId;
  const avatarUrl = user?.imageUrl ?? "";
  const cursorColor = getCursorColor(identity.userId);

  await liveblocks.getOrCreateRoom(projectId, { defaultAccesses: [] });

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: { displayName, avatarUrl, cursorColor },
  });
  session.allow(projectId, session.FULL_ACCESS);

  const { status, body: sessionBody } = await session.authorize();
  return new Response(sessionBody, { status });
}
