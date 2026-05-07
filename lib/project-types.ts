export interface EditorProject {
  id: string
  name: string
  owned: boolean
  roomId: string
}

export interface EditorProjectLists {
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
}
