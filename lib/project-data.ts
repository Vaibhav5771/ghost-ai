import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import type { EditorProject, EditorProjectLists } from "@/lib/project-types"

const editorProjectSelect = {
  id: true,
  name: true,
} as const

type SelectedProject = { id: string; name: string }

function toEditorProject(project: SelectedProject, owned: boolean): EditorProject {
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

  // Run sequentially — Prisma Postgres direct connections have a low concurrent
  // connection limit; parallel queries cause ETIMEDOUT on the second query.
  const ownedProjects: SelectedProject[] = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: editorProjectSelect,
  })

  const sharedProjects: SelectedProject[] =
    userEmails.length > 0
      ? await prisma.project.findMany({
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
      : []

  return {
    ownedProjects: ownedProjects.map((project) => toEditorProject(project, true)),
    sharedProjects: sharedProjects.map((project) => toEditorProject(project, false)),
  }
}
