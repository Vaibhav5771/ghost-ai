"use client"

import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

const ZOOM_DURATION_MS = 200

interface UseKeyboardShortcutsOptions {
  reactFlow: Pick<ReactFlowInstance, "zoomIn" | "zoomOut">
  undo: () => void
  redo: () => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return true
  return target.isContentEditable
}

export function useKeyboardShortcuts({ reactFlow, undo, redo }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return

      const mod = e.metaKey || e.ctrlKey

      if (mod && !e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault()
        undo()
        return
      }
      if (mod && e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault()
        redo()
        return
      }
      if (mod && (e.key === "y" || e.key === "Y")) {
        e.preventDefault()
        redo()
        return
      }

      if (mod) return

      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        reactFlow.zoomIn({ duration: ZOOM_DURATION_MS })
        return
      }
      if (e.key === "-") {
        e.preventDefault()
        reactFlow.zoomOut({ duration: ZOOM_DURATION_MS })
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [reactFlow, undo, redo])
}
