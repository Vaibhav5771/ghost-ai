"use client"

import { useCallback, useEffect } from "react"
import { ReactFlow, Background, BackgroundVariant, MiniMap, ConnectionMode, useReactFlow } from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useMutation } from "@liveblocks/react"

import type { CanvasNode, CanvasEdge } from "@/types/canvas"
import { SHAPE_DRAG_TYPE, type ShapeDragPayload } from "@/types/canvas"
import { CanvasNodeComponent } from "./canvas-node"
import { MinimapShape } from "./minimap-shape"
import { ShapePanel } from "./shape-panel"

const nodeTypes = { canvasNode: CanvasNodeComponent }
let nodeCounter = 0

export function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })
  const { screenToFlowPosition } = useReactFlow()

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
        connectionMode={ConnectionMode.Loose}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap
          nodeComponent={MinimapShape}
          nodeColor="oklch(0.7 0 0)"
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
    </div>
  )
}
