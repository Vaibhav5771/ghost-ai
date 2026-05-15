# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Feature 09 complete

## Current Goal

- Build the next editor workspace feature spec when added.

## Completed

- **01-design-system**: shadcn/ui installed via CLI, dark theme configured in globals.css, lib/utils.ts cn() helper created, all 7 UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), lucide-react installed, TypeScript compiles clean.
- **02-editor**: EditorNavbar (fixed top navbar, sidebar toggle with PanelLeftOpen/PanelLeftClose) and ProjectSidebar (fixed floating overlay, slide-in from left, Tabs with My Projects/Shared, New project button) created in components/editor/. Dialog pattern satisfied by existing shadcn Dialog primitives. TypeScript compiles clean.
- **03-auth**: Clerk wired into Next.js 16. `proxy.ts` at project root with protected-first strategy (public: /sign-in, /sign-up). `ClerkProvider` wraps root layout with `dark` theme from `@clerk/ui/themes` and CSS variable overrides. `/` redirects authenticated users to `/editor`, unauthenticated to `/sign-in`. Two-panel auth layout (logo/tagline left, Clerk form right; form-only on mobile) at `app/(auth)/layout.tsx`. Sign-in/sign-up pages use `<SignIn />` and `<SignUp />` Clerk components. `UserButton` added to editor navbar right section. `app/editor/page.tsx` created. `@clerk/ui` installed.
- **03-auth UI polish**: Auth layout refined to a professional 50/50 desktop split with a differentiated left brand panel, tighter feature rows, and centered Clerk card. Sign-in/sign-up Clerk components now use shadcn + dark theme styling, Geist font variables, icon social buttons, and token-based dark form controls.
- **03-auth logout fix**: `UserButton` now redirects to `/sign-in` after sign-out, avoiding the root redirect handoff that could leave logout stuck on `Rendering...`.
- **04-project-dialogs**: Editor home screen added with heading, description, and Plus-backed New Project CTA. Dedicated `useProjectDialogs` hook manages mock project data, dialog state, form state, slug previews, and loading state. Sidebar New project, rename, and delete actions are wired to Create/Rename/Delete dialogs. Owned project actions are hidden for shared projects. Mobile sidebar now has an outside-tap scrim.
- **05-prisma**: Project and ProjectCollaborator models added in `prisma/models/project.prisma` with ProjectStatus enum, Clerk owner ID, optional description, status, future canvas JSON path, timestamps, cascade collaborator relation, uniqueness, and required indexes. Prisma Client singleton added in `lib/prisma.ts` with `accelerateUrl` for `prisma+postgres://`, direct `@prisma/adapter-pg` for standard Postgres URLs, and development global caching. Initial migration `20260507071804_add_project_models` created and applied. Prisma client generated.
- **06-project-api**: Backend REST route handlers added at `app/api/projects/route.ts` and `app/api/projects/[projectId]/route.ts`. `GET /api/projects` lists the authenticated user's projects, `POST /api/projects` creates a project with the Clerk user ID as `ownerId` and defaults missing names to `Untitled Project`, `PATCH /api/projects/[projectId]` renames owner-owned projects, and `DELETE /api/projects/[projectId]` deletes owner-owned projects. `/api/projects(.*)` now passes through `proxy.ts` so handlers return the required JSON `401`; missing or non-owner mutation targets return `403`.
- **07-wire-editor-home**: `/editor` is a server component again and fetches owned/shared project lists through `getEditorProjects()` before passing them to the client editor shell. Added `/editor/[projectId]` workspace route using the same server data path. Added `hooks/use-project-actions.ts` for create/rename/delete dialog state and project API mutations. Create generates a slug-based room/project ID with a short unique suffix, sends it to `POST /api/projects`, and navigates to `/editor/[projectId]`; rename refreshes server data after `PATCH`; delete redirects to `/editor` when deleting the active workspace and otherwise refreshes. Sidebar and dialogs now use real project data, room ID previews, rename prefill, and delete project names.
- **08-editor-workspace-shell**: `/editor/[projectId]` is now a proper server component with auth and access checks. Unauthenticated users redirect to `/sign-in`; missing or unauthorized projects render `components/editor/access-denied.tsx` (centered lock icon + back link). `lib/project-access.ts` provides `getCurrentIdentity()` (Clerk userId + primary email) and `getProjectForUser()` (owner-or-collaborator access check via Prisma). `components/editor/workspace-shell.tsx` is a client component rendering: navbar with project name, disabled Share button, AI panel toggle, and UserButton; existing ProjectSidebar with active room highlighted; canvas placeholder; collapsible right AI panel placeholder. No canvas logic, Liveblocks, or real sharing added.
- **09-share-dialog**: Share button in the workspace navbar is now active. `app/api/projects/[projectId]/collaborators/route.ts` provides GET (list, owner or collaborator), POST (invite, owner only), and DELETE (remove, owner only). Prisma P2002 on duplicate invite returns 409. Collaborator emails are enriched with display name and avatar via a single batched `clerkClient().users.getUserList()` call; falls back to email-only when no Clerk user is found. `components/editor/share-dialog.tsx` is a client Dialog with: project-link copy row with "Copied!" feedback; invite form (owner only); collaborator list with avatar/initials fallback and per-row remove button (owner only); loading skeleton and empty state. Collaborators see a read-only list.

## In Progress

- None.

## Next Up

- Build the next editor workspace feature spec when added.

## Session Notes (09)
- Collaborator enrichment uses a single batched `clerkClient().users.getUserList({ emailAddress: emails })` call to avoid per-row Clerk API requests.
- Prisma `@@unique([projectId, email])` catches duplicate invites as a P2002 error returned as 409.
- `ShareDialog` manages its own fetch/state; workspace-shell passes `isOwner={activeProject.owned}` to gate invite/remove controls.

## Session Notes (08)
- Feature 08 verification: `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass when run through WSL with Node 20.20.0 from `/home/vaibh/.nvm/versions/node/v20.20.0/bin` and a Linux PATH.
- `PanelRightOpen`/`PanelRightClose` confirmed available in lucide-react ^0.469.0.

## Open Questions

- `context/architecture-context.md` is referenced by AGENTS.md but is missing; `context/architecture.md` appears to be the active architecture context.

## Architecture Decisions

- Using shadcn/ui on Tailwind v4: CSS variables defined in globals.css via `@theme inline` (no tailwind.config.js)
- Dark-only theme: CSS variables set on `:root`, no light-mode override
- shadcn components live in `components/ui/` — generated by CLI, not modified after installation
- cn() helper in `lib/utils.ts` uses clsx + tailwind-merge
- Animation utilities (animate-in, fade-in-0, zoom-in-95, slide-in-from-*) defined via `@utility` in globals.css for Tailwind v4 compatibility
- `components.json` present at project root for shadcn CLI configuration
- Editor chrome components live in `components/editor/` — hand-authored, not generated
- Project sidebar is `fixed` positioned (floats above canvas, does not push content); slide-in via CSS transform transition
- Auth uses Clerk v7 (`@clerk/nextjs` ^7.3.0); proxy.ts (not middleware.ts) per Next.js 16 convention
- ClerkProvider is inside `<body>` per Clerk v7 requirement; uses `dark` theme + CSS var overrides
- Clerk appearance uses `shadcn` + `dark` themes from `@clerk/ui/themes`, with `@clerk/ui/themes/shadcn.css` imported in globals.css
- Auth pages use route group `app/(auth)/` with shared two-panel layout; catch-all segments `[[...sign-in]]` and `[[...sign-up]]` for Clerk's multi-step flows
- Protected-first middleware: all routes protected except NEXT_PUBLIC_CLERK_SIGN_IN_URL, NEXT_PUBLIC_CLERK_SIGN_UP_URL, and `/api/projects(.*)`. Project API routes enforce Clerk auth inside route handlers so they can return the Feature 06-required JSON `401`.
- Project metadata is stored in PostgreSQL through Prisma. Canvas JSON remains externalized for future blob storage via `Project.canvasJsonPath`.
- Prisma Client singleton lives in `lib/prisma.ts`, uses `accelerateUrl` for `prisma+postgres://` URLs and `@prisma/adapter-pg` for direct Postgres URLs, and is cached on `globalThis` outside production.
- Editor workspace URLs use `/editor/[projectId]`; Feature 07 aligns the project ID and Liveblocks room ID by allowing `POST /api/projects` to accept a sanitized slug-style client-generated ID while preserving Prisma's default ID strategy when no ID is supplied.
- `lib/project-access.ts` is the server-side access layer; `lib/project-data.ts` is the server-side data-fetch layer for the sidebar. The two are intentionally separate so the workspace page can do one access check and one full project-list fetch in parallel.

## Session Notes

- Next.js 16.2.4, React 19.2.4, Tailwind v4
- package.json was missing — recreated from package-lock.json, then updated by shadcn CLI during add
- shadcn CLI v4.6.0 used; Node 18 engine warnings are harmless
- In Next.js 16, middleware.ts is renamed to proxy.ts (same API, new name)
- Feature 04 verification: `npm run lint` passes and `npx tsc --noEmit` passes. `npm run build` is blocked in WSL because Node is 18.20.8; Next.js 16.2.4 requires Node >=20.9.0.
- Feature 05 verification: `npx prisma format`, `npx prisma validate`, `npx prisma migrate dev --name add_project_models`, `npx prisma generate`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass when run through WSL with Node 20.20.0 from `/home/vaibh/.nvm/versions/node/v20.20.0/bin`.
- Feature 06 spec read: backend project API routes only; UI wiring is explicitly out of scope.
- Feature 06 verification: `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass when run through WSL with Node 20.20.0 from `/home/vaibh/.nvm/versions/node/v20.20.0/bin` and a compact Linux-only PATH.
- Feature 07 spec read: editor home must fetch project lists server-side, use real project API mutations, show room ID previews, navigate create results to workspaces, refresh rename/delete, and redirect home when deleting the active workspace.
- Feature 07 verification: `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass when run through WSL with Node 20.20.0 from `/home/vaibh/.nvm/versions/node/v20.20.0/bin` and a Linux PATH that includes `/bin` for npm script spawning.
