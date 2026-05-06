"use client"

import { useMemo, useState } from "react"

export interface MockProject {
  id: string
  name: string
  slug: string
  owned: boolean
}

type DialogType = "create" | "rename" | "delete" | null

const initialProjects: MockProject[] = [
  {
    id: "aurora-system-map",
    name: "Aurora System Map",
    slug: "aurora-system-map",
    owned: true,
  },
  {
    id: "checkout-redesign",
    name: "Checkout Redesign",
    slug: "checkout-redesign",
    owned: true,
  },
  {
    id: "shared-platform-notes",
    name: "Shared Platform Notes",
    slug: "shared-platform-notes",
    owned: false,
  },
]

function createSlug(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  )
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<MockProject[]>(initialProjects)
  const [dialog, setDialog] = useState<DialogType>(null)
  const [activeProject, setActiveProject] = useState<MockProject | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const slugPreview = useMemo(() => createSlug(projectName), [projectName])
  const ownedProjects = projects.filter((project) => project.owned)
  const sharedProjects = projects.filter((project) => !project.owned)

  function openCreateDialog() {
    setActiveProject(null)
    setProjectName("")
    setDialog("create")
  }

  function openRenameDialog(project: MockProject) {
    setActiveProject(project)
    setProjectName(project.name)
    setDialog("rename")
  }

  function openDeleteDialog(project: MockProject) {
    setActiveProject(project)
    setProjectName("")
    setDialog("delete")
  }

  function closeDialog() {
    if (isLoading) {
      return
    }

    setDialog(null)
    setActiveProject(null)
    setProjectName("")
  }

  function createProject() {
    const name = projectName.trim()

    if (!name) {
      return
    }

    setIsLoading(true)
    setProjects((currentProjects) => [
      {
        id: `${slugPreview}-${Date.now()}`,
        name,
        slug: slugPreview,
        owned: true,
      },
      ...currentProjects,
    ])
    setIsLoading(false)
    closeDialog()
  }

  function renameProject() {
    const name = projectName.trim()

    if (!activeProject || !name) {
      return
    }

    setIsLoading(true)
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === activeProject.id
          ? { ...project, name, slug: createSlug(name) }
          : project
      )
    )
    setIsLoading(false)
    closeDialog()
  }

  function deleteProject() {
    if (!activeProject) {
      return
    }

    setIsLoading(true)
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== activeProject.id)
    )
    setIsLoading(false)
    closeDialog()
  }

  return {
    activeProject,
    closeDialog,
    createProject,
    deleteProject,
    dialog,
    isLoading,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    ownedProjects,
    projectName,
    renameProject,
    setProjectName,
    sharedProjects,
    slugPreview,
  }
}
