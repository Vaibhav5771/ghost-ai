"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { Button } from "@/components/ui/button";
import { useProjectDialogs } from "@/components/editor/use-project-dialogs";

export default function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectDialogs = useProjectDialogs();

  return (
    <div className="min-h-screen">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={projectDialogs.openCreateDialog}
        onDeleteProject={projectDialogs.openDeleteDialog}
        onRenameProject={projectDialogs.openRenameDialog}
        ownedProjects={projectDialogs.ownedProjects}
        sharedProjects={projectDialogs.sharedProjects}
      />
      <main className="flex min-h-screen items-center justify-center px-6 pt-12">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Create a project or open an existing one
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button className="mt-6" onClick={projectDialogs.openCreateDialog}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>
      <ProjectDialogs
        activeProject={projectDialogs.activeProject}
        dialog={projectDialogs.dialog}
        isLoading={projectDialogs.isLoading}
        onClose={projectDialogs.closeDialog}
        onCreate={projectDialogs.createProject}
        onDelete={projectDialogs.deleteProject}
        onNameChange={projectDialogs.setProjectName}
        onRename={projectDialogs.renameProject}
        projectName={projectDialogs.projectName}
        slugPreview={projectDialogs.slugPreview}
      />
    </div>
  );
}
