"use client"

import type { CanvasShape } from "@/types/canvas"

const DEFAULT_FILL = "oklch(0.22 0 0)"
const REST_BORDER = "rgba(255,255,255,0.15)"
const SELECTED_BORDER = "oklch(0.7 0.15 250)"

interface ShapeVisualProps {
  shape: CanvasShape
  selected?: boolean
  color?: string
}

export function ShapeVisual({ shape, selected, color }: ShapeVisualProps) {
  const fill = color ?? DEFAULT_FILL
  const border = selected ? SELECTED_BORDER : REST_BORDER

  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    const borderRadius =
      shape === "rectangle" ? 6 : shape === "pill" ? 9999 : "50%"
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: fill,
          border: `1px solid ${border}`,
          borderRadius,
          boxSizing: "border-box",
        }}
      />
    )
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      {shape === "diamond" && (
        <polygon
          points="50,1 99,50 50,99 1,50"
          fill={fill}
          stroke={border}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {shape === "hexagon" && (
        <polygon
          points="25,3 75,3 97,50 75,97 25,97 3,50"
          fill={fill}
          stroke={border}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {shape === "cylinder" && (
        <>
          <path
            d="M 1,12 L 1,88 A 49,12 0 0 0 99,88 L 99,12 A 49,12 0 0 1 1,12 Z"
            fill={fill}
            stroke={border}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="50"
            cy="12"
            rx="49"
            ry="12"
            fill={fill}
            stroke={border}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
    </svg>
  )
}
