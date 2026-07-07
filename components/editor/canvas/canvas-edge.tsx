"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react"

import type { CanvasEdge } from "@/types/canvas"

// Kept subtle at rest so a busy canvas doesn't feel noisy; edges brighten to
// the shared accent when hovered/selected, matching node selection color.
const REST_STROKE = "rgba(255,255,255,0.32)"
const ACTIVE_STROKE = "oklch(0.7 0.15 250)"
const STROKE_WIDTH = 1.5
// Invisible fatter path underneath the visible line. React Flow's BaseEdge
// uses the same trick — a wide transparent stroke gives the user a generous
// hit target without inflating the visible line.
const HIT_STROKE_WIDTH = 22

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<never, CanvasEdge>()
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<string>(data?.label ?? "")
  const [inputWidth, setInputWidth] = useState(24)

  const inputRef = useRef<HTMLInputElement>(null)
  const sizerRef = useRef<HTMLSpanElement>(null)

  // Path midpoint coordinates come directly from getSmoothStepPath — no
  // manual (sourceX + targetX) / 2 math, per the spec.
  const [edgePath, labelX, labelY] = useMemo(
    () =>
      getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 8,
      }),
    [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition],
  )

  const label = data?.label ?? ""
  const active = hovered || selected || editing
  const strokeColor = active ? ACTIVE_STROKE : REST_STROKE
  // One inline marker per edge lets the arrowhead brighten with the line
  // (SVG marker fill is baked in — a shared <defs> marker can't recolor
  // per-edge without SVG's `context-stroke`, which has limited browser
  // support).
  const markerId = `canvas-arrow-${id}${active ? "-a" : ""}`

  const startEditing = useCallback(() => {
    // Seed draft from the current label at open time so open→cancel
    // returns to the saved value instead of stale draft state.
    setDraft(label)
    setEditing(true)
  }, [label])

  useEffect(() => {
    if (!editing) return
    const el = inputRef.current
    if (!el) return
    el.focus()
    el.select()
  }, [editing])

  // Grow input width to match the drafted text using a hidden mirror span.
  // useLayoutEffect (not useEffect) so measurement + width update happen
  // synchronously *before* the next paint — otherwise each keystroke
  // renders one frame with the new text but the old width, and the cursor
  // visibly drifts off-center before catching up.
  useLayoutEffect(() => {
    if (!editing) return
    const el = sizerRef.current
    if (!el) return
    setInputWidth(Math.max(24, el.offsetWidth + 4))
  }, [draft, editing])

  const commit = useCallback(() => {
    setEditing(false)
    const next = draft.trim()
    if (next !== label) {
      // Routes through onEdgesChange, the same collaborative flow that
      // node color/shape updates use — no direct storage writes.
      updateEdgeData(id, { label: next })
    }
  }, [id, draft, label, updateEdgeData])

  const cancel = useCallback(() => {
    setEditing(false)
    setDraft(label)
  }, [label])

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth={10}
          markerHeight={10}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
          overflow="visible"
        >
          {/* Chevron (open path) painted stroke-only, no fill. This avoids the
              fill/stroke alpha-stacking that made a "skeleton" outline visible
              when the rest color has alpha. Round line-cap on the two open
              ends + round line-join at the tip gives all three corners a
              proper rounded look with no double-painted pixels. */}
          <path
            d="M 1 1 L 8 5 L 1 9"
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </marker>
      </defs>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={HIT_STROKE_WIDTH}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={(e) => {
          e.stopPropagation()
          startEditing()
        }}
        style={{ cursor: "pointer" }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${markerId})`}
        style={{ pointerEvents: "none", transition: "stroke 120ms ease" }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
          style={{
            position: "absolute",
            // inline-block + translate(-50%) locks the container's width to
            // its inner input's rendered width, so translate(-50%) shifts by
            // exactly half of that — growth stays perfectly symmetric around
            // labelX/labelY. `display: block` would let the container widen
            // beyond the input in some layouts and break the centering.
            display: "inline-block",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            fontSize: 11,
            lineHeight: 1.3,
            fontFamily: "inherit",
          }}
        >
          {editing ? (
            <>
              <span
                ref={sizerRef}
                aria-hidden
                style={{
                  position: "absolute",
                  visibility: "hidden",
                  whiteSpace: "pre",
                  fontSize: 11,
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                {draft || " "}
              </span>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    commit()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    cancel()
                  }
                }}
                onKeyDownCapture={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                style={{
                  // box-sizing content-box (default): `width` = content
                  // width. Text is centered inside `width`; padding is
                  // symmetric on both sides; container width = input's
                  // total rendered width. Result: growth is perfectly
                  // symmetric around labelX/labelY.
                  width: inputWidth,
                  boxSizing: "content-box",
                  display: "block",
                  padding: "2px 8px",
                  margin: 0,
                  fontSize: 11,
                  lineHeight: 1.3,
                  fontFamily: "inherit",
                  color: "rgba(255,255,255,0.92)",
                  background: "oklch(0.18 0 0)",
                  border: `1px solid ${ACTIVE_STROKE}`,
                  borderRadius: 9999,
                  outline: "none",
                  textAlign: "center",
                }}
              />
            </>
          ) : label ? (
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                background: "oklch(0.18 0 0)",
                border: `1px solid ${active ? ACTIVE_STROKE : "rgba(255,255,255,0.14)"}`,
                borderRadius: 9999,
                color: "rgba(255,255,255,0.88)",
                whiteSpace: "nowrap",
                userSelect: "none",
                cursor: "text",
                transition: "border-color 120ms ease",
              }}
            >
              {label}
            </span>
          ) : active ? (
            <span
              style={{
                display: "inline-block",
                padding: "2px 6px",
                color: "rgba(255,255,255,0.45)",
                fontStyle: "italic",
                whiteSpace: "nowrap",
                userSelect: "none",
                cursor: "text",
              }}
            >
              Add label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
