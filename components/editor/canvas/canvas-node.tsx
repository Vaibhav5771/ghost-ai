"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"
import { ShapeVisual } from "./shape-visual"

export function CanvasNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ShapeVisual
        shape={data.shape ?? "rectangle"}
        selected={selected}
        color={data.color}
      />
      <Handle type="target" position={Position.Top} />
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 8px",
          fontSize: 12,
          color: "rgba(255,255,255,0.85)",
          userSelect: "none",
          pointerEvents: "none",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {data.label}
      </span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
