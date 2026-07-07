import type { Node, Edge } from "@xyflow/react"

export type CanvasShape = "rectangle" | "circle" | "diamond" | "pill" | "cylinder" | "hexagon"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color?: string
  textColor?: string
  shape?: CanvasShape
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">

export interface ShapeDragPayload {
  shape: CanvasShape
  width: number
  height: number
}

export const SHAPE_DRAG_TYPE = "application/ghost-shape"

export interface NodeColorPair {
  id: string
  name: string
  background: string
  text: string
}

export const DEFAULT_NODE_BACKGROUND = "oklch(0.22 0 0)"
export const DEFAULT_NODE_TEXT = "rgba(255,255,255,0.85)"

// Text colors carry the same hue as the background so labels feel tinted
// rather than plain white/black. Lightness is pushed far from the background
// (light bg → very dark text, dark bg → very light text) to keep readable
// contrast, and chroma is kept high enough to stay visibly colored.
export const NODE_COLOR_PALETTE: readonly NodeColorPair[] = [
  { id: "default", name: "Default", background: DEFAULT_NODE_BACKGROUND, text: DEFAULT_NODE_TEXT },
  { id: "blue",    name: "Blue",    background: "oklch(0.42 0.16 250)", text: "oklch(0.94 0.06 250)" },
  { id: "emerald", name: "Emerald", background: "oklch(0.42 0.13 160)", text: "oklch(0.94 0.08 160)" },
  { id: "amber",   name: "Amber",   background: "oklch(0.72 0.15 75)",  text: "oklch(0.28 0.10 75)"  },
  { id: "rose",    name: "Rose",    background: "oklch(0.48 0.18 15)",  text: "oklch(0.94 0.06 15)"  },
  { id: "violet",  name: "Violet",  background: "oklch(0.42 0.17 300)", text: "oklch(0.94 0.07 300)" },
  { id: "cyan",    name: "Cyan",    background: "oklch(0.68 0.11 210)", text: "oklch(0.26 0.08 210)" },
] as const
