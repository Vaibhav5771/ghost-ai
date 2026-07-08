"use client"

import { useUser } from "@clerk/nextjs"
import { useOthers } from "@liveblocks/react"
import { useViewport } from "@xyflow/react"

const CURSOR_WIDTH = 16
const CURSOR_HEIGHT = 22

interface CursorEntry {
  id: string
  connectionId: number
  x: number
  y: number
  displayName: string
  color: string
}

function CursorOverlay({ entry }: { entry: CursorEntry }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${entry.x}px, ${entry.y}px)`,
      }}
    >
      <svg
        width={CURSOR_WIDTH}
        height={CURSOR_HEIGHT}
        viewBox="0 0 16 22"
        style={{ display: "block", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}
      >
        <path
          d="M1 1 L1 15 L5 11 L7.5 18 L10 17 L7.5 10 L13 10 Z"
          fill={entry.color}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          position: "absolute",
          top: CURSOR_HEIGHT - 4,
          left: CURSOR_WIDTH - 2,
          padding: "2px 6px",
          borderRadius: 4,
          backgroundColor: entry.color,
          color: "white",
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
        }}
      >
        {entry.displayName}
      </span>
    </div>
  )
}

export function LiveCursors() {
  const { user } = useUser()
  const others = useOthers()
  // useViewport subscribes to pan/zoom changes and returns the transform, so
  // we can project flow-space coordinates to pane-relative screen coordinates
  // without measuring the DOM. `flowToScreenPosition` on useReactFlow would
  // return viewport-relative (clientX/Y) coordinates instead, which don't
  // align with this overlay's positioning parent.
  const { x: tx, y: ty, zoom } = useViewport()

  // React Compiler memoizes this automatically; useMemo tripped the
  // preserve-manual-memoization lint (deps didn't match its inference).
  const cursors: CursorEntry[] = []
  for (const other of others) {
    const id = other.id
    const info = other.info
    const cursor = other.presence?.cursor
    if (!id || !info || !cursor) continue
    if (user?.id && id === user.id) continue
    cursors.push({
      id,
      connectionId: other.connectionId,
      x: cursor.x * zoom + tx,
      y: cursor.y * zoom + ty,
      displayName: info.displayName,
      color: info.cursorColor,
    })
  }

  if (cursors.length === 0) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {cursors.map((entry) => (
        <CursorOverlay key={`${entry.id}-${entry.connectionId}`} entry={entry} />
      ))}
    </div>
  )
}
