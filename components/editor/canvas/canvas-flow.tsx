"use client"

import { useCallback } from "react"
import { ReactFlow, Background, BackgroundVariant, MiniMap, ConnectionMode, useReactFlow } from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useMutation } from "@liveblocks/react"

import type { CanvasNode, CanvasEdge } from "@/types/canvas"
import { SHAPE_DRAG_TYPE, type ShapeDragPayload } from "@/types/canvas"
import { CanvasNodeComponent } from "./canvas-node"
import { ShapePanel } from "./shape-panel"

const nodeTypes = { canvasNode: CanvasNodeComponent }
let nodeCounter = 0

export function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })
  const { screenToFlowPosition } = useReactFlow()

  const addNode = useMutation(({ storage }, node: CanvasNode) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage.get("flow").get("nodes").set(node.id, node as any)
  }, [])

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
      addNode(node)
    },
    [screenToFlowPosition, addNode],
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
