import { put } from "@vercel/blob";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const canvasNodeSchema: z.ZodType<CanvasNode> = z.any();
const canvasEdgeSchema: z.ZodType<CanvasEdge> = z.any();

export const generateSpecTask = schemaTask({
  id: "generate-spec",
  maxDuration: 300,
  schema: z.object({
    projectId: z.string().min(1),
    projectName: z.string().optional(),
    nodes: z.array(canvasNodeSchema),
    edges: z.array(canvasEdgeSchema),
  }),
  run: async ({ projectId, projectName, nodes, edges }) => {
    logger.log("generate-spec building markdown", {
      projectId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });

    // TODO(LLM): swap this deterministic renderer for a model call that
    // turns the canvas into a rich spec. For now emit a straightforward
    // listing so the blob write + downstream consumers can be exercised.
    const title = projectName ?? projectId;
    const nodeSection = nodes.length
      ? nodes
          .map((node) => {
            const label = node.data?.label ?? node.id;
            return `- **${label}** (\`${node.id}\`, shape: ${node.data?.shape ?? "rectangle"})`;
          })
          .join("\n")
      : "_No nodes on the canvas yet._";

    const edgeSection = edges.length
      ? edges
          .map((edge) => {
            const label = edge.data?.label ? ` — ${edge.data.label}` : "";
            return `- \`${edge.source}\` → \`${edge.target}\`${label}`;
          })
          .join("\n")
      : "_No connections yet._";

    const markdown = [
      `# ${title} — Design Spec`,
      "",
      "## Nodes",
      nodeSection,
      "",
      "## Connections",
      edgeSection,
      "",
    ].join("\n");

    // Same private-blob pattern used by app/api/projects/[projectId]/canvas/route.ts
    // so reads go through the SDK with the read-write token.
    const blob = await put(`projects/${projectId}/spec.md`, markdown, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "text/markdown; charset=utf-8",
    });

    return { projectId, url: blob.url, pathname: blob.pathname };
  },
});
