"use client"

import { useRef } from "react"
import type { CanvasShape, ShapeDragPayload } from "@/types/canvas"
import { SHAPE_DRAG_TYPE } from "@/types/canvas"
import { ShapeVisual } from "./shape-visual"

interface ShapeConfig {
  shape: CanvasShape
  width: number
  height: number
}

const SHAPES: ShapeConfig[] = [
  { shape: "rectangle", width: 160, height: 80 },
  { shape: "diamond",   width: 140, height: 140 },
  { shape: "circle",    width: 100, height: 100 },
  { shape: "pill",      width: 160, height: 70 },
  { shape: "cylinder",  width: 120, height: 80 },
  { shape: "hexagon",   width: 120, height: 110 },
]

function ShapeIcon({ shape }: { shape: CanvasShape }) {
  const s = { stroke: "currentColor", fill: "none", strokeWidth: 1.5 } as const
  switch (shape) {
    case "rectangle":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <rect x="2" y="5" width="16" height="10" rx="1" {...s} />
        </svg>
      )
    case "diamond":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polygon points="10,2 18,10 10,18 2,10" {...s} />
        </svg>
      )
    case "circle":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" {...s} />
        </svg>
      )
    case "pill":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <rect x="2" y="6" width="16" height="8" rx="4" {...s} />
        </svg>
      )
    case "cylinder":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <ellipse cx="10" cy="5" rx="7" ry="2.5" {...s} />
          <line x1="3" y1="5" x2="3" y2="15" {...s} />
          <line x1="17" y1="5" x2="17" y2="15" {...s} />
          <ellipse cx="10" cy="15" rx="7" ry="2.5" {...s} />
        </svg>
      )
    case "hexagon":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <polygon points="10,2 17,6 17,14 10,18 3,14 3,6" {...s} />
        </svg>
      )
  }
}

export function ShapePanel() {
  const previewRefs = useRef<Partial<Record<CanvasShape, HTMLDivElement | null>>>({})

  return (
    <>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-2 rounded-full bg-[oklch(0.18_0_0)] border border-white/10 shadow-xl">
        {SHAPES.map((config) => (
          <button
            key={config.shape}
            draggable
            onDragStart={(e) => {
              const payload: ShapeDragPayload = {
                shape: config.shape,
                width: config.width,
                height: config.height,
              }
              e.dataTransfer.setData(SHAPE_DRAG_TYPE, JSON.stringify(payload))
              e.dataTransfer.effectAllowed = "copy"
              const preview = previewRefs.current[config.shape]
              if (preview) {
                e.dataTransfer.setDragImage(
                  preview,
                  config.width / 2,
                  config.height / 2,
                )
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing"
            title={config.shape}
          >
            <ShapeIcon shape={config.shape} />
          </button>
        ))}
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: -10000,
          pointerEvents: "none",
        }}
      >
        {SHAPES.map((config) => (
          <div
            key={config.shape}
            ref={(el) => {
              previewRefs.current[config.shape] = el
            }}
            style={{ width: config.width, height: config.height }}
          >
            <ShapeVisual shape={config.shape} />
          </div>
        ))}
      </div>
    </>
  )
}
