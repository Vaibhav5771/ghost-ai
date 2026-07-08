import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export const generateDesignTask = schemaTask({
  id: "generate-design",
  maxDuration: 300,
  schema: z.object({
    projectId: z.string().min(1),
    prompt: z.string().min(1),
  }),
  run: async ({ projectId, prompt }) => {
    logger.log("generate-design received prompt", { projectId, promptLength: prompt.length });

    // TODO(LLM): call the design model with `prompt` and map the response
    // into CanvasNode/CanvasEdge. This skeleton returns an empty design so
    // the API route + Liveblocks writer can be wired up first.
    const nodes: CanvasNode[] = [];
    const edges: CanvasEdge[] = [];

    // TODO(liveblocks): push nodes/edges into the room's Storage.flow.
    // The room API surface for React Flow storage is Yjs-based, so the
    // straightforward path is: return the design from this task, then have
    // the API caller apply it via @liveblocks/react-flow on the client, OR
    // build a server-side Yjs update using @liveblocks/node.

    return { projectId, nodes, edges };
  },
});
