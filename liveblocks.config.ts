import type { LiveblocksFlow } from "@liveblocks/react-flow";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {
      flow: LiveblocksFlow<CanvasNode, CanvasEdge>;
    };

    UserMeta: {
      id: string;
      info: {
        displayName: string;
        avatarUrl: string;
        cursorColor: string;
      };
    };

    RoomEvent: {};

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};
