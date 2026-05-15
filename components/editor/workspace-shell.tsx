"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
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
  const projectActions = useProjectActions({ activeProjectId: activeProject.id })

  function openProject(projectId: string) {
    setIsSidebarOpen(false)
    router.push(`/editor/${projectId}`)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="z-40 flex h-12 shrink-0 items-center border-b border-border bg-card px-2">
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
        <span className="ml-3 truncate text-sm font-semibold text-foreground">
          {activeProject.name}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShareOpen(true)}
            aria-label="Share"
          >
            <Share2 className="mr-1.5 h-4 w-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAiPanelOpen((prev) => !prev)}
            aria-label="Toggle AI sidebar"
          >
            {isAiPanelOpen ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelRightOpen className="h-5 w-5" />
            )}
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

        <main className="flex flex-1 items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Canvas coming soon</p>
        </main>

        {isAiPanelOpen ? (
          <aside className="flex w-80 shrink-0 items-center justify-center border-l border-border bg-card">
            <p className="text-sm text-muted-foreground">AI chat coming soon</p>
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
