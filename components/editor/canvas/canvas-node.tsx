"use client"

import { useEffect, useRef, useState } from "react"
import { Handle, NodeResizeControl, Position, useUpdateNodeInternals, type NodeProps } from "@xyflow/react"
import { useMutation } from "@liveblocks/react"

import type { CanvasNode } from "@/types/canvas"
import { DEFAULT_NODE_TEXT, NODE_COLOR_PALETTE } from "@/types/canvas"
import { ShapeVisual } from "./shape-visual"
import { NodeColorToolbar } from "./node-color-toolbar"

const MIN_WIDTH = 60
const MIN_HEIGHT = 40
const ACCENT = "oklch(0.7 0.15 250)"

// macOS-style resize handles: small white filled circles with a subtle dark
// outline. All 8 use the same shape/size so the frame reads as a clean grid
// of dots on the bounding-box outline rather than mixed rectangles.
const HANDLE_STYLE: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  backgroundColor: "#fff",
  border: "1px solid rgba(0,0,0,0.35)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
}

const CORNER_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const
const HORIZONTAL_SIDES = ["left", "right"] as const
const VERTICAL_SIDES = ["top", "bottom"] as const

// Small, subtle connection handles (white dot + dark ring) that fade in on
// node hover. Kept visually distinct from the square resize handles above.
const CONNECT_HANDLE_STYLE: React.CSSProperties = {
  width: 8,
  height: 8,
  background: "#ffffff",
  border: "1.5px solid oklch(0.18 0 0)",
  borderRadius: "50%",
  boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
  transition: "opacity 120ms ease",
}

const CONNECT_SIDES = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
] as const

export function CanvasNodeComponent({ id, data, selected }: NodeProps<CanvasNode>) {
  const [editing, setEditing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const updateNodeInternals = useUpdateNodeInternals()

  // Force React Flow to remeasure this node's handles on mount. Without this,
  // nodes that existed in Storage before the handle IDs changed keep their
  // stale `internals.handleBounds` (React Flow only recomputes on resize),
  // and new edges referencing "top"/"right"/"bottom"/"left" fail lookup
  // with error 008.
  useEffect(() => {
    updateNodeInternals(id)
  }, [id, updateNodeInternals])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Prefer explicit textColor; fall back to the palette pair for the current
  // background so contrast stays correct even if textColor didn't sync.
  const textColor =
    data.textColor ??
    NODE_COLOR_PALETTE.find((p) => p.background === data.color)?.text ??
    DEFAULT_NODE_TEXT

  const updateLabel = useMutation(
    ({ storage }, nodeId: string, label: string) => {
      const liveNode = storage.get("flow").get("nodes").get(nodeId)
      if (!liveNode || typeof (liveNode as { get?: unknown }).get !== "function") {
        return
      }
      const dataField = (liveNode as unknown as {
        get: (k: string) => unknown
      }).get("data")
      if (
        dataField &&
        typeof (dataField as { set?: unknown }).set === "function"
      ) {
        ;(dataField as { set: (k: string, v: unknown) => void }).set(
          "label",
          label,
        )
      }
    },
    [],
  )

  useEffect(() => {
    if (!editing) return
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.select()
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [editing])

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {selected && (
        <>
          {/* Bounding-box outline that connects the 8 handles into a complete
              selection frame. Sits above the shape (which may be rounded or
              non-rectangular) so the actual drag area reads clearly. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: `1px solid ${ACCENT}`,
              borderRadius: 2,
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          />
          {CORNER_POSITIONS.map((position) => (
            <NodeResizeControl
              key={position}
              position={position}
              minWidth={MIN_WIDTH}
              minHeight={MIN_HEIGHT}
              style={HANDLE_STYLE}
            />
          ))}
          {HORIZONTAL_SIDES.map((position) => (
            <NodeResizeControl
              key={position}
              position={position}
              resizeDirection="horizontal"
              minWidth={MIN_WIDTH}
              minHeight={MIN_HEIGHT}
              style={HANDLE_STYLE}
            />
          ))}
          {VERTICAL_SIDES.map((position) => (
            <NodeResizeControl
              key={position}
              position={position}
              resizeDirection="vertical"
              minWidth={MIN_WIDTH}
              minHeight={MIN_HEIGHT}
              style={HANDLE_STYLE}
            />
          ))}
        </>
      )}
      <ShapeVisual
        shape={data.shape ?? "rectangle"}
        selected={selected}
        color={data.color}
      />
      {selected && (
        <NodeColorToolbar nodeId={id} activeBackground={data.color} />
      )}
      {CONNECT_SIDES.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          // Keep handles interactive at all times (pointerEvents stays auto):
          // fading them out with `pointer-events: none` breaks connection drags
          // — the moment the pointer leaves the node during a drag, the handle
          // stops receiving events and the wire is dropped.
          style={{
            ...CONNECT_HANDLE_STYLE,
            opacity: hovered ? 1 : 0,
          }}
        />
      ))}
      <div
        onDoubleClick={(e) => {
          if (editing) return
          e.stopPropagation()
          setEditing(true)
        }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 8px",
        }}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            className="nodrag nopan nowheel"
            value={data.label}
            placeholder="Add label"
            rows={1}
            onChange={(e) => {
              updateLabel(id, e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault()
                setEditing(false)
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              padding: 0,
              margin: 0,
              color: textColor,
              fontSize: 12,
              fontFamily: "inherit",
              textAlign: "center",
              lineHeight: 1.4,
              overflow: "hidden",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 12,
              lineHeight: 1.4,
              color: textColor,
              opacity: data.label ? 1 : 0.45,
              userSelect: "none",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              textAlign: "center",
              cursor: "text",
            }}
          >
            {data.label || "Add label"}
          </span>
        )}
      </div>
    </div>
  )
}
