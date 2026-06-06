"use client"

import { useEffect, useRef, useState } from "react"
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"
import { useMutation } from "@liveblocks/react"

import type { CanvasNode } from "@/types/canvas"
import { ShapeVisual } from "./shape-visual"

const MIN_WIDTH = 60
const MIN_HEIGHT = 40
const ACCENT = "oklch(0.7 0.15 250)"

export function CanvasNodeComponent({ id, data, selected }: NodeProps<CanvasNode>) {
  const [editing, setEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: "oklch(0.18 0 0)",
          border: `1px solid ${ACCENT}`,
        }}
        lineStyle={{ borderColor: "transparent" }}
      />
      <ShapeVisual
        shape={data.shape ?? "rectangle"}
        selected={selected}
        color={data.color}
      />
      <Handle type="target" position={Position.Top} />
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
              color: "rgba(255,255,255,0.95)",
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
              color: data.label
                ? "rgba(255,255,255,0.85)"
                : "rgba(255,255,255,0.35)",
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
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
