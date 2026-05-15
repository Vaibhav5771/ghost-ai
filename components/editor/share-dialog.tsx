"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Loader2, UserMinus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Collaborator {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  isOwner: boolean
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  isOwner,
}: ShareDialogProps) {
  // null = not yet loaded; array = loaded (possibly empty)
  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLoading = open && collaborators === null

  useEffect(() => {
    if (!open) return
    let cancelled = false

    fetch(`/api/projects/${projectId}/collaborators`)
      .then((r) => r.json())
      .then((data: { collaborators?: Collaborator[] }) => {
        if (!cancelled) setCollaborators(data.collaborators ?? [])
      })
      .catch(() => {
        if (!cancelled) setCollaborators([])
      })

    return () => {
      cancelled = true
    }
  }, [open, projectId])

  function handleOpenChange(next: boolean) {
    if (!next) setCollaborators(null)
    onOpenChange(next)
  }

  function copyLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/editor/${projectId}`
        : `/editor/${projectId}`
    void navigator.clipboard.writeText(url)
    setIsCopied(true)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setIsCopied(false), 2000)
  }

  async function invite() {
    const email = inviteEmail.trim().toLowerCase()
    if (!email || isInviting) return
    setIsInviting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { collaborator: Collaborator }
      setCollaborators((prev) => [...(prev ?? []), data.collaborator])
      setInviteEmail("")
    } finally {
      setIsInviting(false)
    }
  }

  async function remove(email: string) {
    if (removingEmail) return
    setRemovingEmail(email)
    try {
      await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setCollaborators((prev) => (prev ?? []).filter((c) => c.email !== email))
    } finally {
      setRemovingEmail(null)
    }
  }

  const projectUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/editor/${projectId}`
      : `/editor/${projectId}`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Invite people to collaborate on this project."
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={projectUrl}
            className="flex-1 text-xs text-muted-foreground"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyLink}
            aria-label="Copy link"
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isOwner && (
          <div className="grid gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Invite people
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void invite()
              }}
            >
              <Input
                type="email"
                placeholder="name@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inviteEmail.trim() || isInviting}
              >
                {isInviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
            </form>
          </div>
        )}

        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            People with access
          </p>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : !collaborators || collaborators.length === 0 ? (
            <p className="py-2 text-xs text-muted-foreground">
              No collaborators yet.
            </p>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {collaborators.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-1">
                    <CollaboratorAvatar
                      avatarUrl={c.avatarUrl}
                      name={c.name}
                      email={c.email}
                    />
                    <div className="min-w-0 flex-1">
                      {c.name ? (
                        <>
                          <p className="truncate text-sm font-medium text-foreground">
                            {c.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        </>
                      ) : (
                        <p className="truncate text-sm text-foreground">
                          {c.email}
                        </p>
                      )}
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => void remove(c.email)}
                        disabled={removingEmail === c.email}
                        aria-label={`Remove ${c.email}`}
                      >
                        {removingEmail === c.email ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserMinus className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CollaboratorAvatar({
  avatarUrl,
  name,
  email,
}: {
  avatarUrl: string | null
  name: string | null
  email: string
}) {
  const initial = (name ?? email).charAt(0).toUpperCase()

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name ?? email}
        className="h-7 w-7 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {initial}
    </div>
  )
}
