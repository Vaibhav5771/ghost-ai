import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#7986CB",
  "#4FC3F7",
  "#4DB6AC",
  "#81C784",
  "#FFD54F",
  "#FF8A65",
  "#A1887F",
];

export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash * 31) + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

const globalForLiveblocks = globalThis as unknown as {
  liveblocks?: Liveblocks;
};

function createClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY must be set.");
  return new Liveblocks({ secret });
}

export const liveblocks =
  globalForLiveblocks.liveblocks ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocks = liveblocks;
}
