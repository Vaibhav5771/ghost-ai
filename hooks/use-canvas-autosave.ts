"use client"

import { useEffect, useRef, useState } from "react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error"

interface UseCanvasAutosaveOptions {
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  enabled: boolean
  debounceMs?: number
}

// React Flow attaches ephemeral local-only fields (selected, dragging, measured,
// resizing) to each node/edge that must NOT trigger an autosave. Serialize only
// the persistent shape so selection wobble doesn't roundtrip through the API.
function serializeNode(node: CanvasNode) {
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
    width: node.width,
    height: node.height,
  }
}

function serializeEdge(edge: CanvasEdge) {
  return {
    id: edge.id,
    type: edge.type,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: edge.data,
  }
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
  debounceMs = 1500,
}: UseCanvasAutosaveOptions): { status: CanvasSaveStatus } {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle")
  const timerRef = useRef<number | null>(null)
  const lastSerializedRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled) return

    const payload = {
      nodes: nodes.map(serializeNode),
      edges: edges.map(serializeEdge),
    }
    const serialized = JSON.stringify(payload)

    // First serialization after `enabled` flips to true is the baseline: the
    // just-loaded state matches the server, so skip the save.
    if (lastSerializedRef.current === null) {
      lastSerializedRef.current = serialized
      return
    }
    // No persistent shape change — leave any pending timer alone so React Flow's
    // constant selection/hover/measure re-renders don't kill in-flight debounces.
    if (lastSerializedRef.current === serialized) return
    lastSerializedRef.current = serialized

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(async () => {
      timerRef.current = null
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setStatus("saving")
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: serialized,
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Canvas save failed: ${response.status}`)
        setStatus("saved")
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        setStatus("error")
      }
    }, debounceMs)
    // Intentionally no cleanup returned — the pending timer must survive
    // re-renders that don't change the serialized payload.
  }, [projectId, nodes, edges, enabled, debounceMs])

  // Cancel any pending timer / in-flight save on unmount or when autosave is
  // disabled (e.g. project switch mid-save).
  useEffect(() => {
    if (enabled) return
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    abortRef.current?.abort()
  }, [enabled])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      abortRef.current?.abort()
    }
  }, [])

  return { status }
}
