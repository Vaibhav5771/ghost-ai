"use client"

import { useCallback, useEffect } from "react"
import { ReactFlow, Background, BackgroundVariant, MiniMap, ConnectionMode, useReactFlow } from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useMutation, useRedo, useUndo } from "@liveblocks/react"

import type { CanvasNode, CanvasEdge } from "@/types/canvas"
import { SHAPE_DRAG_TYPE, type ShapeDragPayload } from "@/types/canvas"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

// Fallback shown in the minimap for nodes that have no palette color set.
// Deliberately lighter than DEFAULT_NODE_BACKGROUND so uncolored nodes remain
// visible against the dark minimap background.
const MINIMAP_DEFAULT_NODE_COLOR = "oklch(0.7 0 0)"
import { CanvasNodeComponent } from "./canvas-node"
import { CanvasEdgeComponent } from "./canvas-edge"
import { MinimapShape } from "./minimap-shape"
import { ShapePanel } from "./shape-panel"
import { CanvasControls } from "./canvas-controls"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

const nodeTypes = { canvasNode: CanvasNodeComponent }
const edgeTypes = { canvasEdge: CanvasEdgeComponent }
// New connections default to the custom edge type — the canvas-edge marker
// is rendered inline per edge, so no global MarkerType/markerEnd is set here.
const defaultEdgeOptions = { type: "canvasEdge" as const }
let nodeCounter = 0

interface CanvasFlowProps {
  templatesOpen: boolean
  onTemplatesOpenChange: (open: boolean) => void
}

export function CanvasFlow({ templatesOpen, onTemplatesOpenChange }: CanvasFlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })
  const reactFlow = useReactFlow()
  const { screenToFlowPosition, fitView } = reactFlow
  const undo = useUndo()
  const redo = useRedo()

  useKeyboardShortcuts({ reactFlow, undo, redo })

  // Heal rooms that contain plain-object nodes from the pre-fix drop handler.
  // Liveblocks-react-flow expects each stored value to be a LiveObject; a plain
  // object crashes on the first `.get`/`.setLocal` call during measure/drag.
  const removeLegacyNodes = useMutation(({ storage }) => {
    const nodesMap = storage.get("flow").get("nodes")
    const legacy: CanvasNode[] = []
    for (const [, entry] of nodesMap.entries()) {
      if (typeof (entry as { get?: unknown }).get !== "function") {
        legacy.push({ ...(entry as unknown as CanvasNode) })
      }
    }
    for (const node of legacy) {
      nodesMap.delete(node.id)
    }
    return legacy
  }, [])

  useEffect(() => {
    const legacy = removeLegacyNodes()
    if (legacy.length > 0) {
      onNodesChange(legacy.map((item) => ({ type: "add", item })))
    }
  }, [removeLegacyNodes, onNodesChange])

  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      // Fresh clones per import so React Flow / Liveblocks own the objects
      // and later mutations (drag, label edit) don't scribble on the shared
      // constants exported from starter-templates.ts.
      const templateNodes: CanvasNode[] = template.nodes.map((node) => ({
        ...node,
        position: { ...node.position },
        data: { ...node.data },
      }))
      const templateEdges: CanvasEdge[] = template.edges.map((edge) => ({
        ...edge,
        data: edge.data ? { ...edge.data } : {},
      }))

      // Replace, don't append: clear the room first so the template lands on
      // an empty canvas regardless of prior work. onDelete drives the same
      // Storage-sync path as user-initiated deletes, so it stays inside the
      // collaborative flow.
      if (nodes.length > 0 || edges.length > 0) {
        onDelete({ nodes, edges })
      }
      if (templateNodes.length > 0) {
        onNodesChange(templateNodes.map((item) => ({ type: "add", item })))
      }
      if (templateEdges.length > 0) {
        onEdgesChange(templateEdges.map((item) => ({ type: "add", item })))
      }

      onTemplatesOpenChange(false)

      // fitView after the change has flushed — nodes need to be measured by
      // React Flow's ResizeObserver first so bounds are known.
      requestAnimationFrame(() => {
        fitView({ duration: 400, padding: 0.2 })
      })
    },
    [nodes, edges, onDelete, onNodesChange, onEdgesChange, onTemplatesOpenChange, fitView],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData(SHAPE_DRAG_TYPE)
      if (!raw) return
      const payload = JSON.parse(raw) as ShapeDragPayload
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      position.x -= payload.width / 2
      position.y -= payload.height / 2
      const id = `${payload.shape}-${Date.now()}-${++nodeCounter}`
      const node: CanvasNode = {
        id,
        type: "canvasNode",
        position,
        data: { label: "", shape: payload.shape },
        width: payload.width,
        height: payload.height,
      }
      // Route insertion through onNodesChange so @liveblocks/react-flow wraps
      // the node as a LiveObject (with NODE_BASE_CONFIG). A plain `.set(id, node)`
      // would lack the `setLocal`/atomic-field machinery that drag/select use.
      onNodesChange([{ type: "add", item: node }])
    },
    [screenToFlowPosition, onNodesChange],
  )

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap
          nodeComponent={MinimapShape}
          nodeColor={(n) => (n as CanvasNode).data?.color ?? MINIMAP_DEFAULT_NODE_COLOR}
          maskColor="rgba(0,0,0,0.55)"
          style={{
            backgroundColor: "#1f1f23",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        />
      </ReactFlow>
      <ShapePanel />
      <CanvasControls />
      <StarterTemplatesModal
        open={templatesOpen}
        onOpenChange={onTemplatesOpenChange}
        onImport={importTemplate}
      />
    </div>
  )
}
