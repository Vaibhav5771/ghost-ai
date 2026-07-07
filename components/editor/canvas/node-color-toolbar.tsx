"use client"

import { useState } from "react"
import { useReactFlow } from "@xyflow/react"

import { NODE_COLOR_PALETTE, type CanvasNode, type NodeColorPair } from "@/types/canvas"

interface NodeColorToolbarProps {
  nodeId: string
  activeBackground?: string
}

export function NodeColorToolbar({ nodeId, activeBackground }: NodeColorToolbarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { updateNodeData } = useReactFlow<CanvasNode>()

  // Route through xyflow's updateNodeData so the change dispatches an
  // onNodesChange "replace" that @liveblocks/react-flow reconciles as one
  // atomic update. Direct nested LiveObject `.set()` calls left the text
  // and background momentarily out of sync between subscriber notifications.
  const applyColor = (pair: NodeColorPair) => {
    updateNodeData(nodeId, { color: pair.background, textColor: pair.text })
  }

  return (
    <div
      className="nodrag nopan"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 8px",
        borderRadius: 9999,
        background: "oklch(0.18 0 0)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
    >
      {NODE_COLOR_PALETTE.map((pair) => {
        const isActive = activeBackground === pair.background
        const isHovered = hoveredId === pair.id
        return (
          <button
            key={pair.id}
            type="button"
            title={pair.name}
            aria-label={pair.name}
            aria-pressed={isActive}
            onClick={(e) => {
              e.stopPropagation()
              applyColor(pair)
            }}
            onMouseEnter={() => setHoveredId(pair.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === pair.id ? null : prev))}
            style={{
              width: 18,
              height: 18,
              padding: 0,
              borderRadius: "50%",
              background: pair.background,
              border: isActive
                ? `2px solid ${pair.text}`
                : "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
              boxShadow: isHovered ? `0 0 4px 1px ${pair.text}` : "none",
              transform: isHovered ? "scale(1.12)" : "scale(1)",
              transition: "box-shadow 120ms ease, transform 120ms ease",
            }}
          />
        )
      })}
    </div>
  )
}
