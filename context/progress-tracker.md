# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Feature 14 complete

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

- **10-liveblocks-setup**: `liveblocks.config.ts` updated with `Presence` (`cursor: {x,y}|null`, `isThinking: boolean`) and `UserMeta` (`info.displayName`, `info.avatarUrl`, `info.cursorColor`). `lib/liveblocks.ts` provides a cached `@liveblocks/node` client and `getCursorColor()` (deterministic hash over a 10-color palette). `app/api/liveblocks-auth/route.ts` is a `POST` endpoint that requires Clerk auth, verifies project access via `getProjectForUser`, calls `getOrCreateRoom` to idempotently create the room, and returns an access-token session with `displayName`, `avatarUrl`, and `cursorColor`. Returns 401/403 for unauthenticated/unauthorized requests. `@liveblocks/node@^3.19.1` installed. `LIVEBLOCKS_SECRET_KEY` placeholder added to `.env.local`. TypeScript compiles clean.

- **11-base-canvas**: `types/canvas.ts` defines `CanvasNodeData` (label, color, shape), `CanvasNode` (`canvasNode` type), and `CanvasEdge` (`canvasEdge` type). `liveblocks.config.ts` Storage updated to `{ flow: LiveblocksFlow<CanvasNode, CanvasEdge> }`. `components/editor/canvas/canvas-wrapper.tsx` sets up `LiveblocksProvider` → `RoomProvider` (with `initialStorage` seeding empty nodes/edges `LiveMap`s and `initialPresence`) → `ClientSideSuspense` → `CanvasFlow`, plus a class-based error boundary for Liveblocks connection failures. `components/editor/canvas/canvas-flow.tsx` uses `useLiveblocksFlow({ suspense: true })` wired into `ReactFlow` with `ConnectionMode.Loose`, `fitView`, dot-pattern `Background`, and `MiniMap`. `@xyflow/react/dist/style.css` imported in `globals.css`. `npm run build` passes.

- **12-shape-panel**: `CanvasShape` type extended to `rectangle | circle | diamond | pill | cylinder | hexagon` with `ShapeDragPayload` and `SHAPE_DRAG_TYPE` exported from `types/canvas.ts`. `components/editor/canvas/shape-panel.tsx` is a pill-shaped floating toolbar (absolute, bottom-center, z-10) with six draggable icon buttons; each button encodes shape + default dimensions as JSON in the `application/ghost-shape` dataTransfer key. `components/editor/canvas/canvas-node.tsx` renders every `canvasNode` type as a bordered rectangle with the label centered; connects via top/bottom handles. `canvas-flow.tsx` wired `nodeTypes`, `onDragOver`, and `onDrop`; drop handler reads the payload, calls `screenToFlowPosition` (centered on cursor), generates an ID as `${shape}-${timestamp}-${counter}`, and inserts via `useMutation` into `storage.flow.nodes`. `canvas-wrapper.tsx` wraps `CanvasFlow` in `ReactFlowProvider` so `useReactFlow` has context. `npm run build` passes without type errors.

- **13-node-shape**: New `components/editor/canvas/shape-visual.tsx` renders all six node shapes, sharing constants for default fill (`oklch(0.22 0 0)`), rest border (`rgba(255,255,255,0.15)`), and selected border (`oklch(0.7 0.15 250)`). Rectangle, pill, and circle use CSS (`border-radius` of `6`, `9999`, and `50%`); diamond, hexagon, and cylinder render via SVG with `viewBox="0 0 100 100"`, `preserveAspectRatio="none"` so they stretch to the node's width/height, and `vectorEffect="non-scaling-stroke"` so the 1px stroke stays consistent at any size. Cylinder is composed of a body path plus a top ellipse (back arc hidden behind the ellipse fill). `canvas-node.tsx` now wraps `ShapeVisual` with absolutely-positioned label and top/bottom handles. `shape-panel.tsx` adds an off-screen drag-preview container (`position: absolute; left: -10000px`) holding six `ShapeVisual` previews sized to each shape's default width/height; `onDragStart` calls `dataTransfer.setDragImage(preview, width/2, height/2)` so the ghost stays centered on the cursor. The browser automatically hides the drag image on drop or cancel. `npm run build` passes without type errors.

- **14-node-editing**: `canvas-node.tsx` now mounts `<NodeResizer>` (visible only when `selected`, `minWidth=60`, `minHeight=40`, transparent line variant, 8x8 square handles with dark fill and accent `oklch(0.7 0.15 250)` border) so React Flow's controlled resize changes flow back through the same `onNodesChange` path that `@liveblocks/react-flow` wraps. The label container is a single absolute, `inset:0`, flex-centered div that swaps a centered `<span>` (with `"Add label"` placeholder in dimmer text when `data.label` is empty) and a `<textarea>` in-place — same parent, no layout shift. Double-clicking the container (with `stopPropagation` so React Flow does not also receive it) enters edit mode; the textarea is `rows={1}` with auto-grow on input (`scrollHeight` measurement) and centered text. Editing closes on `onBlur` or `Escape`. Textarea carries `className="nodrag nopan nowheel"` and stops `mousedown`/`pointerdown`/`wheel` propagation so typing, drag-selecting, and wheel scrolling inside the textarea do not start node drag, pane pan, or pane zoom. Label writes go through a `useMutation` that calls `storage.get("flow").get("nodes").get(id).get("data").set("label", value)` on the underlying LiveObject — the same Storage path the legacy-heal mutation uses — keeping updates on the existing collaborative flow without going through `onNodesChange`. The component subscribes to `data.label` as the controlled value so live updates from other clients are reflected immediately. `npx tsc --noEmit` and `npm run lint` pass clean.

## In Progress

- None.

## Next Up

- Build the next editor workspace feature spec when added.

## Session Notes (14)
- `<NodeResizer>` is added inside the custom node and only sets `isVisible`/`min*` props; it dispatches `dimensions` + `position` changes through the same `onNodesChange` that `useLiveblocksFlow` already wraps, so resize syncs to Storage without any custom mutation. Verified the `NODE_BASE_CONFIG` in `@liveblocks/react-flow` makes `position` atomic and treats `width`/`height` as deep-synced fields.
- Label writes can't go through `onNodesChange` with a `replace` change because `useLiveblocksFlow` syncs `data` as a (deep) LiveObject — replacing the whole node would re-create the LiveObject and break references for in-flight selection/drag state. Direct LiveObject write via `useMutation` (`storage.get("flow").get("nodes").get(id).get("data").set("label", value)`) is the path that keeps the existing node identity and patches just the label key.
- Existing `data.label` reads come from the controlled `nodes` array returned by `useLiveblocksFlow`, which already subscribes to Storage. Using it as the textarea's `value` keeps the typing experience real-time without local mirror state and lets concurrent updates from other clients show up live.
- Label + textarea share one `position: absolute; inset: 0; display: flex; align-items: center; justify-content: center` container; swapping the inner child in place is what satisfies "no layout shift" — sizes/positions are identical between the two modes.
- Textarea uses `rows={1}` and auto-resizes on input by setting `style.height = "auto"` then `scrollHeight + "px"`. Initial mount runs the same measurement inside the `editing` effect so labels that were already multi-line open at the correct height.
- `className="nodrag nopan nowheel"` plus `stopPropagation` on `mousedown`/`pointerdown`/`wheel` was needed (just `nodrag`/`nopan` was not enough in 12.10.2 — wheel scrolling inside the textarea still bubbled to the pane zoom, and React Flow occasionally claimed the pointer for selection-box drag before nodrag could short-circuit).
- Initial `useEffect` had a second effect that called `setEditing(false)` when the node became deselected. React 19's `react-hooks/set-state-in-effect` flagged it, and it was redundant anyway — clicking off the node loses focus on the textarea, which triggers `onBlur` → `setEditing(false)`. Removed.
- Empty-label rendering: when `data.label` is falsy the span renders `"Add label"` at the same centered position with a dimmer color (`rgba(255,255,255,0.35)`), so the placeholder occupies the same slot a real label would, matching the spec's "same centered position" requirement. The textarea also carries `placeholder="Add label"` so the same hint shows while editing an empty node.

## Session Notes (13)
- Shape rendering split into a shared `ShapeVisual` component so the same renderer powers both the node and the drag preview — keeps shapes visually identical and avoids drift.
- `preserveAspectRatio="none"` + `vectorEffect="non-scaling-stroke"` is what lets diamond/hexagon/cylinder stretch to arbitrary node sizes without distorting the stroke width.
- HTML5 drag image element needs to be in the DOM and rendered (not `display: none`) when `setDragImage` is called, so the off-screen previews use `position: absolute; left: -10000px` rather than `display: none` or `visibility: hidden`.
- Drag image is centered on the cursor by passing `(width/2, height/2)` as the offset to `setDragImage` — matches the drop handler which centers the node on `clientX`/`clientY`.
- Fix carried over from feature 12: `canvas-flow.tsx` previously dropped nodes via a custom `useMutation` that did `storage.get("flow").get("nodes").set(id, node as any)`. That stored a plain object, so as soon as React Flow tried to drag/measure/select the node `@liveblocks/react-flow` crashed with `node.setLocal is not a function` or `node.get is not a function`. Insertion now goes through `onNodesChange([{ type: "add", item: node }])`, which is the library's own path and runs the internal `toLiveblocksInternalNode` wrapper (LiveObject + `NODE_BASE_CONFIG` with atomic `position` and local-only `selected`/`dragging`/`measured`/`resizing`).
- Legacy data heal: rooms persisted by the broken handler still contain plain-object nodes. `canvas-flow.tsx` adds a `removeLegacyNodes` mutation + `useEffect` that runs once on mount — it scans `storage.flow.nodes` for entries missing a LiveObject `.get` method, deletes them, then re-adds them through `onNodesChange` so they get re-wrapped. Subsequent loads are no-ops. The mutation runs synchronously inside the effect, before React Flow's ResizeObserver fires, so the first measurement pass operates on healthy LiveObjects.
- MiniMap shapes: by default `<MiniMap>` renders every node as a rounded rect. `components/editor/canvas/minimap-shape.tsx` is a custom `nodeComponent` that subscribes to each node's data via `useNodesData(id)` and emits the matching SVG primitive: `<rect rx={5}>` for rectangle, `<rect rx={height/2}>` for pill, `<ellipse>` for circle, `<polygon>` for diamond/hexagon, and a body `<path>` + top `<ellipse>` for cylinder. Passed to `<MiniMap nodeComponent={MinimapShape}>` so the minimap visualization matches the canvas.

## Session Notes (12)
- `useMutation` storage insert uses `node as any` to bypass the strict `LiveObject<...>` generic on the Liveblocks React Flow node type — Liveblocks serializes plain objects at runtime.
- `ReactFlowProvider` must wrap `CanvasFlow` (not just `ReactFlow`) because `useReactFlow` is called in the same component that renders `<ReactFlow>`, not inside it.
- Node IDs are generated with a module-level counter so they remain unique across multiple drops in the same session.

## Session Notes (10)
- `@liveblocks/node` was not in package.json; installed at `^3.19.1` to match existing liveblocks packages.
- `lib/liveblocks.ts` caches the Liveblocks instance on `globalThis` in non-production (mirrors the Prisma singleton pattern).
- `getCursorColor` uses a simple djb2-style hash (`hash = (hash * 31 + charCode) >>> 0`) for deterministic mapping of any user ID to one of 10 Material-palette hex colors.
- Auth route calls `currentUser()` once after the access check to avoid a Clerk API call on unauthorized requests.
- `LIVEBLOCKS_SECRET_KEY` placeholder added to `.env.local` — must be filled in before the auth route will work.

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
- Feature 14 verification: `npx tsc --noEmit` and `npm run lint` pass clean for `components/editor/canvas/canvas-node.tsx`. `npm run build` compiles the touched code but stops in page-data collection because this Windows checkout has no `.env.local` (`DATABASE_URL` unset) — environmental, not a code regression. `npx prisma generate` was run once locally because `app/generated/prisma` did not exist on this machine; this is a per-machine setup step, not a code change. The Windows checkout was also missing `lightningcss-win32-x64-msvc` (Tailwind v4's native CSS binary); `npm install --no-save lightningcss-win32-x64-msvc` repaired this for local builds without touching `package.json`.
- Feature 14 not interactively verified: the dev server was not started in-session, so resize/edit flows have not been exercised in a browser. Worth sanity-checking before shipping.
