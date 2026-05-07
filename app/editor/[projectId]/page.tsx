import { EditorHome } from "@/components/editor/editor-home"
import { getEditorProjects } from "@/lib/project-data"

interface EditorWorkspacePageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function EditorWorkspacePage({ params }: EditorWorkspacePageProps) {
  const [{ projectId }, projectLists] = await Promise.all([params, getEditorProjects()])

  return <EditorHome activeProjectId={projectId} {...projectLists} />
}
