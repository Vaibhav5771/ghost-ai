"use client"

import { Component, type ReactNode } from "react"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"
import { LiveObject, LiveMap } from "@liveblocks/client"
import { ReactFlowProvider } from "@xyflow/react"

import { CanvasFlow } from "./canvas-flow"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"

interface CanvasWrapperProps {
  projectId: string
  templatesOpen: boolean
  onTemplatesOpenChange: (open: boolean) => void
  onSaveStatusChange?: (status: CanvasSaveStatus) => void
}

class LiveblocksErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export function CanvasWrapper({
  projectId,
  templatesOpen,
  onTemplatesOpenChange,
  onSaveStatusChange,
}: CanvasWrapperProps) {
  return (
    <LiveblocksErrorBoundary
      fallback={
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Unable to connect to canvas.</p>
        </div>
      }
    >
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={projectId}
          initialPresence={{ cursor: null, thinking: false }}
          initialStorage={() => ({
            flow: new LiveObject({
              nodes: new LiveMap(),
              edges: new LiveMap(),
            }),
          })}
        >
          <ClientSideSuspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading canvas…</p>
              </div>
            }
          >
            <ReactFlowProvider>
              <CanvasFlow
                projectId={projectId}
                templatesOpen={templatesOpen}
                onTemplatesOpenChange={onTemplatesOpenChange}
                onSaveStatusChange={onSaveStatusChange}
              />
            </ReactFlowProvider>
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </LiveblocksErrorBoundary>
  )
}
