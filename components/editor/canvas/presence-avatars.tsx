"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { useOthers } from "@liveblocks/react"

const MAX_VISIBLE = 5
const AVATAR_SIZE = 32

interface CollaboratorEntry {
  id: string
  displayName: string
  avatarUrl: string
  cursorColor: string
}

function initialsFromName(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function CollaboratorAvatar({ collaborator }: { collaborator: CollaboratorEntry }) {
  const initials = initialsFromName(collaborator.displayName)
  const style = {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    backgroundColor: collaborator.cursorColor,
  }
  return (
    <div
      title={collaborator.displayName}
      className="pointer-events-none relative flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-background"
      style={style}
    >
      {collaborator.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={collaborator.avatarUrl}
          alt={collaborator.displayName}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  )
}

function OverflowChip({ count }: { count: number }) {
  return (
    <div
      className="pointer-events-none flex shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white ring-2 ring-background"
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
    >
      +{count}
    </div>
  )
}

export function PresenceAvatars() {
  const { user } = useUser()
  const others = useOthers()

  // React Compiler memoizes this automatically; useMemo tripped the
  // preserve-manual-memoization lint (deps didn't match its inference).
  const seen = new Set<string>()
  const collaborators: CollaboratorEntry[] = []
  for (const other of others) {
    const id = other.id
    const info = other.info
    if (!id || !info) continue
    if (user?.id && id === user.id) continue
    if (seen.has(id)) continue
    seen.add(id)
    collaborators.push({
      id,
      displayName: info.displayName,
      avatarUrl: info.avatarUrl,
      cursorColor: info.cursorColor,
    })
  }

  const visible = collaborators.slice(0, MAX_VISIBLE)
  const overflow = Math.max(collaborators.length - MAX_VISIBLE, 0)
  const hasCollaborators = collaborators.length > 0

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2">
      {hasCollaborators ? (
        <>
          <div className="flex items-center -space-x-2">
            {visible.map((collaborator) => (
              <CollaboratorAvatar
                key={collaborator.id}
                collaborator={collaborator}
              />
            ))}
            {overflow > 0 ? <OverflowChip count={overflow} /> : null}
          </div>
          <div
            aria-hidden="true"
            className="h-6 w-px bg-white/15"
          />
        </>
      ) : null}
      <div
        className="pointer-events-auto flex items-center justify-center"
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: AVATAR_SIZE, height: AVATAR_SIZE },
            },
          }}
        />
      </div>
    </div>
  )
}
