"use client"

import { useMemo } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates"
import type { CanvasNode } from "@/types/canvas"
import { DEFAULT_NODE_BACKGROUND } from "@/types/canvas"

const PREVIEW_WIDTH = 260
const PREVIEW_HEIGHT = 140
const PREVIEW_PADDING = 12
const REST_STROKE = "rgba(255,255,255,0.28)"

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Start from a template</DialogTitle>
          <DialogDescription>
            Import a pre-built diagram. This replaces the current canvas.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="grid grid-cols-1 gap-3 pr-3 sm:grid-cols-2">
            {CANVAS_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onImport={() => onImport(template)}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface TemplateCardProps {
  template: CanvasTemplate
  onImport: () => void
}

function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <TemplatePreview template={template} />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">{template.name}</span>
        <p className="text-xs text-muted-foreground">{template.description}</p>
      </div>
      <Button size="sm" onClick={onImport} className="self-end">
        Import
      </Button>
    </div>
  )
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

function nodeRect(node: CanvasNode): Rect {
  return {
    x: node.position.x,
    y: node.position.y,
    width: node.width ?? 160,
    height: node.height ?? 80,
  }
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const layout = useMemo(() => computeLayout(template), [template])

  return (
    <div
      className="overflow-hidden rounded-md border border-white/5 bg-[oklch(0.16_0_0)]"
      style={{ width: "100%", height: PREVIEW_HEIGHT }}
    >
      <svg
        viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {layout.edges.map((edge, index) => (
          <line
            key={index}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={REST_STROKE}
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}
        {layout.nodes.map((node) => (
          <PreviewNode key={node.id} node={node} />
        ))}
      </svg>
    </div>
  )
}

interface LayoutNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  shape: CanvasNode["data"]["shape"]
}

interface LayoutEdge {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface Layout {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
}

function computeLayout(template: CanvasTemplate): Layout {
  const rects = template.nodes.map(nodeRect)
  if (rects.length === 0) return { nodes: [], edges: [] }

  const minX = Math.min(...rects.map((r) => r.x))
  const minY = Math.min(...rects.map((r) => r.y))
  const maxX = Math.max(...rects.map((r) => r.x + r.width))
  const maxY = Math.max(...rects.map((r) => r.y + r.height))

  const contentWidth = Math.max(1, maxX - minX)
  const contentHeight = Math.max(1, maxY - minY)
  const availableWidth = PREVIEW_WIDTH - PREVIEW_PADDING * 2
  const availableHeight = PREVIEW_HEIGHT - PREVIEW_PADDING * 2
  const scale = Math.min(availableWidth / contentWidth, availableHeight / contentHeight)

  const scaledWidth = contentWidth * scale
  const scaledHeight = contentHeight * scale
  const offsetX = (PREVIEW_WIDTH - scaledWidth) / 2
  const offsetY = (PREVIEW_HEIGHT - scaledHeight) / 2

  const projected = new Map<string, LayoutNode>()
  template.nodes.forEach((node, index) => {
    const rect = rects[index]
    projected.set(node.id, {
      id: node.id,
      x: (rect.x - minX) * scale + offsetX,
      y: (rect.y - minY) * scale + offsetY,
      width: rect.width * scale,
      height: rect.height * scale,
      color: node.data.color ?? DEFAULT_NODE_BACKGROUND,
      shape: node.data.shape ?? "rectangle",
    })
  })

  const edges: LayoutEdge[] = template.edges
    .map((edge) => {
      const source = projected.get(edge.source)
      const target = projected.get(edge.target)
      if (!source || !target) return null
      return {
        x1: source.x + source.width / 2,
        y1: source.y + source.height / 2,
        x2: target.x + target.width / 2,
        y2: target.y + target.height / 2,
      }
    })
    .filter((edge): edge is LayoutEdge => edge !== null)

  return { nodes: Array.from(projected.values()), edges }
}

function PreviewNode({ node }: { node: LayoutNode }) {
  const stroke = "rgba(255,255,255,0.18)"
  const cx = node.x + node.width / 2
  const cy = node.y + node.height / 2
  const rx = node.width / 2
  const ry = node.height / 2

  switch (node.shape) {
    case "circle":
      return (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={node.color} stroke={stroke} strokeWidth={0.75} />
      )
    case "pill":
      return (
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          rx={node.height / 2}
          ry={node.height / 2}
          fill={node.color}
          stroke={stroke}
          strokeWidth={0.75}
        />
      )
    case "diamond":
      return (
        <polygon
          points={`${cx},${node.y} ${node.x + node.width},${cy} ${cx},${node.y + node.height} ${node.x},${cy}`}
          fill={node.color}
          stroke={stroke}
          strokeWidth={0.75}
        />
      )
    case "hexagon": {
      const inset = node.width * 0.22
      return (
        <polygon
          points={`${node.x + inset},${node.y} ${node.x + node.width - inset},${node.y} ${node.x + node.width},${cy} ${node.x + node.width - inset},${node.y + node.height} ${node.x + inset},${node.y + node.height} ${node.x},${cy}`}
          fill={node.color}
          stroke={stroke}
          strokeWidth={0.75}
        />
      )
    }
    case "cylinder": {
      const capHeight = Math.min(node.height * 0.22, 10)
      return (
        <g>
          <rect
            x={node.x}
            y={node.y + capHeight / 2}
            width={node.width}
            height={node.height - capHeight}
            fill={node.color}
            stroke={stroke}
            strokeWidth={0.75}
          />
          <ellipse
            cx={cx}
            cy={node.y + node.height - capHeight / 2}
            rx={rx}
            ry={capHeight / 2}
            fill={node.color}
            stroke={stroke}
            strokeWidth={0.75}
          />
          <ellipse
            cx={cx}
            cy={node.y + capHeight / 2}
            rx={rx}
            ry={capHeight / 2}
            fill={node.color}
            stroke={stroke}
            strokeWidth={0.75}
          />
        </g>
      )
    }
    case "rectangle":
    default:
      return (
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          rx={2}
          ry={2}
          fill={node.color}
          stroke={stroke}
          strokeWidth={0.75}
        />
      )
  }
}
