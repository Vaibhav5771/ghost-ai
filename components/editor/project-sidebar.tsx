"use client"

import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full w-72 z-50 flex flex-col bg-card border-r border-border transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-sm font-semibold text-foreground">Projects</span>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden px-2 pt-2">
        <Tabs defaultValue="my-projects" className="flex flex-col flex-1">
          <TabsList className="w-full">
            <TabsTrigger value="my-projects" className="flex-1">My Projects</TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects" className="flex-1 flex items-center justify-center mt-0">
            <p className="text-sm text-muted-foreground">No projects yet</p>
          </TabsContent>
          <TabsContent value="shared" className="flex-1 flex items-center justify-center mt-0">
            <p className="text-sm text-muted-foreground">No shared projects</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-3 border-t border-border shrink-0">
        <Button variant="secondary" className="w-full">
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>
    </aside>
  )
}
