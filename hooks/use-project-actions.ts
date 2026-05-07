"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import type { EditorProject } from "@/lib/project-types"

type DialogType = "create" | "rename" | "delete" | null

interface UseProjectActionsOptions {
  activeProjectId?: string
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  )
}

function createShortSuffix() {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)

  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 6)
}

async function readProjectResponse(response: Response) {
  const body = (await response.json()) as { project?: { id?: unknown } }

  if (!response.ok || !body.project || typeof body.project.id !== "string") {
    throw new Error("Project request failed")
  }

  return body.project.id
}

export function useProjectActions({ activeProjectId }: UseProjectActionsOptions = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [dialog, setDialog] = useState<DialogType>(null)
  const [targetProject, setTargetProject] = useState<EditorProject | null>(null)
  const [projectName, setProjectName] = useState("")
  const [roomSuffix, setRoomSuffix] = useState(createShortSuffix)
  const [isLoading, setIsLoading] = useState(false)

  const slugPreview = useMemo(
    () => `${slugify(projectName)}-${roomSuffix}`,
    [projectName, roomSuffix]
  )

  function openCreateDialog() {
    setTargetProject(null)
    setProjectName("")
    setRoomSuffix(createShortSuffix())
    setDialog("create")
  }

  function openRenameDialog(project: EditorProject) {
    setTargetProject(project)
    setProjectName(project.name)
    setDialog("rename")
  }

  function openDeleteDialog(project: EditorProject) {
    setTargetProject(project)
    setProjectName("")
    setDialog("delete")
  }

  function closeDialog() {
    if (isLoading) {
      return
    }

    setDialog(null)
    setTargetProject(null)
    setProjectName("")
  }

  async function createProject() {
    const name = projectName.trim()

    if (!name || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slugPreview, name }),
      })
      const projectId = await readProjectResponse(response)

      setDialog(null)
      setProjectName("")
      router.push(`/editor/${projectId}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function renameProject() {
    const name = projectName.trim()

    if (!targetProject || !name || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${targetProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error("Rename request failed")
      }

      setDialog(null)
      setTargetProject(null)
      setProjectName("")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteProject() {
    if (!targetProject || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${targetProject.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Delete request failed")
      }

      const shouldRedirectHome =
        activeProjectId === targetProject.id || pathname === `/editor/${targetProject.id}`

      setDialog(null)
      setTargetProject(null)
      setProjectName("")

      if (shouldRedirectHome) {
        router.replace("/editor")
      } else {
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    activeProject: targetProject,
    closeDialog,
    createProject,
    deleteProject,
    dialog,
    isLoading,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    projectName,
    renameProject,
    setProjectName,
    slugPreview,
  }
}
