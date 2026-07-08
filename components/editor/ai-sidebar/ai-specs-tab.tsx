"use client"

import { Download, FileText, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AiSpecsTab() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <Button
          type="button"
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          Generate Spec
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-3 px-4 py-4">
          <DemoSpecCard />
        </div>
      </ScrollArea>
    </div>
  )
}

function DemoSpecCard() {
  return (
    <article className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <FileText className="h-4 w-4" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            E-commerce Backend Spec
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            aria-label="Download spec"
            className="h-7 w-7 shrink-0 text-muted-foreground"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          Storefront, checkout, inventory, and payment services with a shared
          Postgres primary and a Redis session cache.
        </p>
      </div>
    </article>
  )
}
