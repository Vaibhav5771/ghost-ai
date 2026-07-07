"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { CanvasWrapper } from "@/components/editor/canvas/canvas-wrapper"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { EditorProject, EditorProjectLists } from "@/lib/project-types"

interface WorkspaceShellProps extends EditorProjectLists {
  activeProject: EditorProject
}

export function WorkspaceShell({
  activeProject,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)

  const projectActions = useProjectActions({
    activeProjectId: activeProject.id,
  })

  function openProject(projectId: string) {
    setIsSidebarOpen(false)
    router.push(`/editor/${projectId}`)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="z-40 flex h-12 shrink-0 items-center border-b border-border bg-card px-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>

          <span className="truncate text-sm font-semibold text-foreground">
            {activeProject.name}
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 pr-2">
          {/* AI Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAiPanelOpen((prev) => !prev)}
            className="gap-2 rounded-lg"
            aria-label="Toggle AI sidebar"
          >
            <span className="text-base">✦</span>
            AI
          </Button>

          {/* Templates Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTemplatesOpen(true)}
            className="gap-2 rounded-lg"
            aria-label="Start from a template"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>

          {/* Share Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsShareOpen(true)}
            className="gap-2 rounded-lg"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <UserButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          activeProjectId={activeProject.id}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCreateProject={projectActions.openCreateDialog}
          onDeleteProject={projectActions.openDeleteDialog}
          onOpenProject={openProject}
          onRenameProject={projectActions.openRenameDialog}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
        />

        <main className="flex-1 overflow-hidden bg-background">
          <CanvasWrapper
            roomId={activeProject.id}
            templatesOpen={isTemplatesOpen}
            onTemplatesOpenChange={setIsTemplatesOpen}
          />
        </main>

        {isAiPanelOpen ? (
          <aside className="flex w-80 shrink-0 items-center justify-center border-l border-border bg-card">
            <p className="text-sm text-muted-foreground">
              AI chat coming soon
            </p>
          </aside>
        ) : null}
      </div>

      <ProjectDialogs
        activeProject={projectActions.activeProject}
        dialog={projectActions.dialog}
        isLoading={projectActions.isLoading}
        onClose={projectActions.closeDialog}
        onCreate={projectActions.createProject}
        onDelete={projectActions.deleteProject}
        onNameChange={projectActions.setProjectName}
        onRename={projectActions.renameProject}
        projectName={projectActions.projectName}
        slugPreview={projectActions.slugPreview}
      />

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        projectId={activeProject.id}
        isOwner={activeProject.owned}
      />
    </div>
  )
}