"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { Button } from "@/components/ui/button"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { EditorProjectLists } from "@/lib/project-types"

interface EditorHomeProps extends EditorProjectLists {
  activeProjectId?: string
}

export function EditorHome({
  activeProjectId,
  ownedProjects,
  sharedProjects,
}: EditorHomeProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const projectActions = useProjectActions({ activeProjectId })
  const allProjects = useMemo(
    () => [...ownedProjects, ...sharedProjects],
    [ownedProjects, sharedProjects]
  )
  const activeProject = allProjects.find((project) => project.id === activeProjectId)

  function openProject(projectId: string) {
    setIsSidebarOpen(false)
    router.push(`/editor/${projectId}`)
  }

  return (
    <div className="min-h-screen">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        activeProjectId={activeProjectId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={projectActions.openCreateDialog}
        onDeleteProject={projectActions.openDeleteDialog}
        onOpenProject={openProject}
        onRenameProject={projectActions.openRenameDialog}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
      />
      <main className="flex min-h-screen items-center justify-center px-6 pt-12">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {activeProject?.name ?? "Create a project or open an existing one"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            {activeProject
              ? `Workspace room: ${activeProject.roomId}`
              : "Start a new architecture workspace, or choose a project from the sidebar."}
          </p>
          <Button className="mt-6" onClick={projectActions.openCreateDialog}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>
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
    </div>
  )
}
