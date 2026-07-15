import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";

import type { Json } from "@liveblocks/core";
import { liveblocks } from "@/lib/liveblocks";
import {
  NODE_COLOR_PALETTE,
  DEFAULT_NODE_BACKGROUND,
  DEFAULT_NODE_TEXT,
  type CanvasAction,
} from "@/types/canvas";

const AI_USER_ID = "ghost-ai";

const SHAPE_SIZES = {
  rectangle: { width: 160, height: 80 },
  circle:    { width: 100, height: 100 },
  diamond:   { width: 120, height: 80 },
  pill:      { width: 160, height: 60 },
  cylinder:  { width: 120, height: 100 },
  hexagon:   { width: 120, height: 100 },
} as const;

const SYSTEM_PROMPT = `You are Ghost AI, a system architecture diagram assistant.
Given a user description, output a canvas diagram as nodes and edges.

SHAPES (pick by role):
- rectangle: services, APIs, controllers, backends
- circle: users, actors, external clients
- diamond: load balancers, routers, gateways, decision points
- pill: queues, event streams, pub/sub, caches
- cylinder: databases, file storage, blob stores
- hexagon: microservices, third-party systems, external APIs

PALETTE IDs (pick by type to visually group):
- "default": dark gray — general nodes
- "blue": services, APIs
- "emerald": databases, storage
- "amber": queues, caches, async systems
- "rose": critical paths, warnings
- "violet": important decisions, gateways
- "cyan": external systems, third-party

LAYOUT:
- Start at x=100, y=100. Flow left-to-right.
- Horizontal spacing: 220px between node centers.
- Vertical spacing: 180px between rows.
- Group related nodes on the same row.

DEFAULT SIZES (use unless the label is very long):
- rectangle 160×80, circle 100×100, diamond 120×80
- pill 160×60, cylinder 120×100, hexagon 120×100

RULES:
- Generate 4–12 nodes. Keep it readable.
- Node IDs: kebab-case, descriptive (e.g. "api-gateway", "user-db").
- Edge IDs: "e-{source}-{target}".
- summary: one sentence describing what was designed.`;

const shapeEnum = z.enum(["rectangle", "circle", "diamond", "pill", "cylinder", "hexagon"]);
const paletteEnum = z.enum(["default", "blue", "emerald", "amber", "rose", "violet", "cyan"]);

const geminiSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      shape: shapeEnum,
      paletteId: paletteEnum,
      x: z.number(),
      y: z.number(),
      width: z.number().nullable(),
      height: z.number().nullable(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      label: z.string().nullable(),
    })
  ),
  summary: z.string(),
});

async function trySetPresence(roomId: string, data: Record<string, Json | undefined>) {
  try {
    await liveblocks.setPresence(roomId, { userId: AI_USER_ID, data });
  } catch {
    // setPresence only affects connected users; ignore if AI has no connection
  }
}

export const designAgentTask = schemaTask({
  id: "design-agent",
  maxDuration: 300,
  schema: z.object({
    prompt: z.string().min(1),
    roomId: z.string().min(1),
  }),
  run: async ({ prompt, roomId }) => {
    logger.log("design-agent started", { roomId, promptLength: prompt.length });

    await trySetPresence(roomId, { cursor: { x: 500, y: 300 }, thinking: true });
    await liveblocks.broadcastEvent(roomId, {
      type: "ai:status",
      message: "Analyzing your design request…",
      thinking: true,
    });

    try {
      const model = createGroq({
        apiKey: process.env.GROQ_API_KEY,
      })("meta-llama/llama-4-scout-17b-16e-instruct");

      await liveblocks.broadcastEvent(roomId, {
        type: "ai:status",
        message: "Generating your architecture…",
        thinking: true,
      });

      const { object } = await generateObject({
        model,
        schema: geminiSchema,
        system: SYSTEM_PROMPT,
        prompt,
      });

      logger.log("design-agent generated", {
        nodeCount: object.nodes.length,
        edgeCount: object.edges.length,
      });

      await liveblocks.broadcastEvent(roomId, {
        type: "ai:status",
        message: "Placing nodes on the canvas…",
        thinking: true,
      });

      // Broadcast each node as a canvas action
      for (const node of object.nodes) {
        const palette = NODE_COLOR_PALETTE.find((p) => p.id === node.paletteId);
        const defaultSize = SHAPE_SIZES[node.shape as keyof typeof SHAPE_SIZES];
        const action: CanvasAction = {
          type: "addNode",
          id: node.id,
          label: node.label,
          shape: node.shape,
          color: palette?.background ?? DEFAULT_NODE_BACKGROUND,
          textColor: palette?.text ?? DEFAULT_NODE_TEXT,
          x: node.x,
          y: node.y,
          width: node.width ?? defaultSize.width,
          height: node.height ?? defaultSize.height,
        };
        await liveblocks.broadcastEvent(roomId, { type: "ai:action", action });
      }

      // Small pause so node rendering settles before edges arrive
      await new Promise((r) => setTimeout(r, 200));

      await liveblocks.broadcastEvent(roomId, {
        type: "ai:status",
        message: "Connecting the nodes…",
        thinking: true,
      });

      // Broadcast each edge as a canvas action
      for (const edge of object.edges) {
        const action: CanvasAction = {
          type: "addEdge",
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label ?? undefined,
        };
        await liveblocks.broadcastEvent(roomId, { type: "ai:action", action });
      }

      await liveblocks.broadcastEvent(roomId, {
        type: "ai:status",
        message: object.summary,
        thinking: false,
      });

      return {
        roomId,
        nodeCount: object.nodes.length,
        edgeCount: object.edges.length,
      };
    } catch (err) {
      logger.error("design-agent failed", { error: String(err) });
      await liveblocks.broadcastEvent(roomId, {
        type: "ai:status",
        message: "Something went wrong. Please try again.",
        thinking: false,
      });
      throw err;
    } finally {
      await trySetPresence(roomId, { cursor: null, thinking: false });
    }
  },
});
