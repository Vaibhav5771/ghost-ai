"use client"

import { Component, type ReactNode } from "react"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"
import { LiveObject, LiveMap } from "@liveblocks/client"
import { ReactFlowProvider } from "@xyflow/react"

import { CanvasFlow } from "./canvas-flow"

interface CanvasWrapperProps {
  roomId: string
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

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
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
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
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
              <CanvasFlow />
            </ReactFlowProvider>
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </LiveblocksErrorBoundary>
  )
}
