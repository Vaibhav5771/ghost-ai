import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import type { EditorProject } from "@/lib/project-types"

export interface CurrentIdentity {
  userId: string
  primaryEmail: string | null
}

export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null

  return { userId, primaryEmail }
}

export async function getProjectForUser(
  projectId: string,
  userId: string,
  userEmail: string | null
): Promise<EditorProject | null> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        ...(userEmail
          ? [{ collaborators: { some: { email: userEmail } } }]
          : []),
      ],
    },
    select: { id: true, name: true, ownerId: true },
  })

  if (!project) return null

  return {
    id: project.id,
    name: project.name,
    owned: project.ownerId === userId,
    roomId: project.id,
  }
}
