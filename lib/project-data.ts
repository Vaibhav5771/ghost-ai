import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import type { EditorProject, EditorProjectLists } from "@/lib/project-types"

const editorProjectSelect = {
  id: true,
  name: true,
} as const

function toEditorProject(project: { id: string; name: string }, owned: boolean): EditorProject {
  return {
    id: project.id,
    name: project.name,
    owned,
    roomId: project.id,
  }
}

export async function getEditorProjects(): Promise<EditorProjectLists> {
  const { userId } = await auth()

  if (!userId) {
    return {
      ownedProjects: [],
      sharedProjects: [],
    }
  }

  const user = await currentUser()
  const userEmails =
    user?.emailAddresses.map((emailAddress) => emailAddress.emailAddress.toLowerCase()) ?? []

  const [ownedProjects, sharedProjects] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: editorProjectSelect,
    }),
    userEmails.length > 0
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: {
                email: { in: userEmails },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          select: editorProjectSelect,
        })
      : [],
  ])

  return {
    ownedProjects: ownedProjects.map((project) => toEditorProject(project, true)),
    sharedProjects: sharedProjects.map((project) => toEditorProject(project, false)),
  }
}
