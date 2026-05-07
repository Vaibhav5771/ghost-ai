import { EditorHome } from "@/components/editor/editor-home"
import { getEditorProjects } from "@/lib/project-data"

export default async function EditorPage() {
  const projectLists = await getEditorProjects()

  return <EditorHome {...projectLists} />
}
