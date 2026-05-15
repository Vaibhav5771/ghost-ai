import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "@/components/editor/workspace-shell"
import { getCurrentIdentity, getProjectForUser } from "@/lib/project-access"
import { getEditorProjects } from "@/lib/project-data"

interface EditorWorkspacePageProps {
  params: Promise<{ projectId: string }>
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const [{ projectId }, identity] = await Promise.all([
    params,
    getCurrentIdentity(),
  ])

  if (!identity) {
    redirect("/sign-in")
  }

  const [activeProject, projectLists] = await Promise.all([
    getProjectForUser(projectId, identity.userId, identity.primaryEmail),
    getEditorProjects(),
  ])

  if (!activeProject) {
    return <AccessDenied />
  }

  return <WorkspaceShell activeProject={activeProject} {...projectLists} />
}
