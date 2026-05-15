"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"

export function CanvasNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: data.color ?? "oklch(0.22 0 0)",
        border: `1px solid ${selected ? "oklch(0.7 0.15 250)" : "rgba(255,255,255,0.15)"}`,
        borderRadius: 6,
        padding: "4px 8px",
        boxSizing: "border-box",
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
        userSelect: "none",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {data.label}
      </span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
