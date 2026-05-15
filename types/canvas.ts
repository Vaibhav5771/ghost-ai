import type { Node, Edge } from "@xyflow/react"

export type CanvasShape = "rectangle" | "circle" | "diamond" | "pill" | "cylinder" | "hexagon"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color?: string
  shape?: CanvasShape
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">
export type CanvasEdge = Edge<Record<string, never>, "canvasEdge">

export interface ShapeDragPayload {
  shape: CanvasShape
  width: number
  height: number
}

export const SHAPE_DRAG_TYPE = "application/ghost-shape"
