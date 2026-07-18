import type { LiveblocksFlow } from "@liveblocks/react-flow";
import type { LiveList, LiveObject } from "@liveblocks/client";
import type { CanvasNode, CanvasEdge, CanvasAction } from "@/types/canvas";
import type { ChatMessage } from "@/types/tasks";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {
      flow: LiveblocksFlow<CanvasNode, CanvasEdge>;
      aiStatus: LiveObject<{ thinking: boolean; message: string }>;
      chatMessages: LiveList<ChatMessage>;
    };

    UserMeta: {
      id: string;
      info: {
        displayName: string;
        avatarUrl: string;
        cursorColor: string;
      };
    };

    RoomEvent:
      | { type: "ai:status"; message: string; thinking: boolean }
      | { type: "ai:action"; action: CanvasAction };

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};
