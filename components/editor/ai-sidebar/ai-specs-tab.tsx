"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, FileText, Loader2, Sparkles, Trash2, X } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SpecItem {
  id: string
  createdAt: string
  filename: string
}

interface AiSpecsTabProps {
  projectId: string
  onGenerateSpec?: () => Promise<void>
  isGeneratingSpec?: boolean
  specRefreshKey?: number
}

async function deleteSpec(projectId: string, specId: string): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/specs/${specId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
}

export function AiSpecsTab({ projectId, onGenerateSpec, isGeneratingSpec = false, specRefreshKey = 0 }: AiSpecsTabProps) {
  const [specs, setSpecs] = useState<SpecItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<SpecItem | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/projects/${projectId}/specs`)
      .then((r) => r.json())
      .then((data: { specs?: SpecItem[] }) => setSpecs(data.specs ?? []))
      .catch(() => setSpecs([]))
      .finally(() => setLoading(false))
  }, [projectId, specRefreshKey])

  const openPreview = useCallback(
    async (spec: SpecItem) => {
      setSelectedSpec(spec)
      setPreviewContent(null)
      setPreviewLoading(true)
      try {
        const res = await fetch(
          `/api/projects/${projectId}/specs/${spec.id}/download`,
        )
        if (res.ok) setPreviewContent(await res.text())
      } catch {
        // previewContent stays null — error state shown in modal
      } finally {
        setPreviewLoading(false)
      }
    },
    [projectId],
  )

  const handleDownload = useCallback(
    (spec: SpecItem) => {
      const a = document.createElement("a")
      a.href = `/api/projects/${projectId}/specs/${spec.id}/download`
      a.download = spec.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    [projectId],
  )

  const handleDelete = useCallback(
    async (spec: SpecItem) => {
      setDeletingId(spec.id)
      try {
        await deleteSpec(projectId, spec.id)
        setSpecs((prev) => prev.filter((s) => s.id !== spec.id))
        if (selectedSpec?.id === spec.id) setSelectedSpec(null)
      } catch {
        // silently ignore — spec stays in list
      } finally {
        setDeletingId(null)
      }
    },
    [projectId, selectedSpec],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <Button
          type="button"
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isGeneratingSpec}
          onClick={onGenerateSpec}
        >
          {isGeneratingSpec ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGeneratingSpec ? "Generating…" : "Generate Spec"}
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 px-4 py-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          {!loading && specs.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No specs yet. Generate one from the AI Architect tab.
            </p>
          )}

          {specs.map((spec) => (
            <SpecCard
              key={spec.id}
              spec={spec}
              onOpen={openPreview}
              onDownload={handleDownload}
              onDelete={handleDelete}
              isDeleting={deletingId === spec.id}
            />
          ))}
        </div>
      </ScrollArea>

      <SpecPreviewModal
        spec={selectedSpec}
        content={previewContent}
        loading={previewLoading}
        onClose={() => setSelectedSpec(null)}
        onDownload={handleDownload}
      />
    </div>
  )
}

function SpecCard({
  spec,
  onOpen,
  onDownload,
  onDelete,
  isDeleting,
}: {
  spec: SpecItem
  onOpen: (spec: SpecItem) => void
  onDownload: (spec: SpecItem) => void
  onDelete: (spec: SpecItem) => void
  isDeleting: boolean
}) {
  const date = new Date(spec.createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <button
      type="button"
      onClick={() => onOpen(spec)}
      disabled={isDeleting}
      className="group flex w-full gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/30 hover:bg-card/80 disabled:opacity-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">
          {spec.filename}
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Download spec"
          className="h-7 w-7 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation()
            onDownload(spec)
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete spec"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(spec)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </button>
  )
}

function SpecPreviewModal({
  spec,
  content,
  loading,
  onClose,
  onDownload,
}: {
  spec: SpecItem | null
  content: string | null
  loading: boolean
  onClose: () => void
  onDownload: (spec: SpecItem) => void
}) {
  return (
    <Dialog open={!!spec} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="flex h-[80vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 [&>button:last-child]:hidden">
        <DialogHeader className="flex shrink-0 flex-row items-center gap-2 border-b border-border px-5 py-3">
          <DialogTitle className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {spec?.filename ?? ""}
          </DialogTitle>
          {spec && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Download spec"
              onClick={() => onDownload(spec)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-6 py-5">
            {loading && (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {!loading && !content && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Could not load spec content.
              </p>
            )}
            {!loading && content && (
              <div className="spec-markdown">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
