# Architecture Context

## Stack

| Layer     | Technology                  | Role   |
| --------- | --------------------------- | ------ |
| Framework | [e.g. Next.js + TypeScript] | [Role] |
| UI        | [e.g. Tailwind + shadcn/ui] | [Role] |
| Auth      | [e.g. Clerk]                | [Role] |
| Database  | [e.g. Prisma + PostgreSQL]  | [Role] |
| [Layer]   | [Technology]                | [Role] |

## System Boundaries

- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]
- `[folder]` — [What this folder owns and is responsible for]

## Storage Model

- **PostgreSQL via Prisma**: Project metadata, Clerk owner IDs,
  collaborator email relationships, project status, timestamps,
  and future canvas blob path references live in the database.
- **Future blob/file storage**: Large generated canvas JSON will
  live outside the database. `Project.canvasJsonPath` stores the
  lookup path for that future storage layer.

## Auth and Access Model

- Every user signs in via Clerk.
- Every project has one owner stored as the Clerk user ID in
  `Project.ownerId`.
- Project collaboration is represented by collaborator email
  rows scoped to a project.

## Invariants

1. [Rule the codebase must never violate — e.g. Request
   handlers do not run long-lived background work]
2. [Invariant two]
3. [Invariant three]
4. [Invariant four]
