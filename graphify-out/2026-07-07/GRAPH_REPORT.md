# Graph Report - .  (2026-07-07)

## Corpus Check
- 203 files · ~72,144 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 313 nodes · 448 edges · 32 communities (22 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Editor Home & Navbar|Editor Home & Navbar]]
- [[_COMMUNITY_Canvas Editor (Nodes & Flow)|Canvas Editor (Nodes & Flow)]]
- [[_COMMUNITY_Editor Pages & Liveblocks Auth|Editor Pages & Liveblocks Auth]]
- [[_COMMUNITY_App Dependencies|App Dependencies]]
- [[_COMMUNITY_Dev Dependencies & Scripts|Dev Dependencies & Scripts]]
- [[_COMMUNITY_Clerk Template tsconfig|Clerk Template: tsconfig]]
- [[_COMMUNITY_Project tsconfig|Project tsconfig]]
- [[_COMMUNITY_shadcn Components Config|shadcn Components Config]]
- [[_COMMUNITY_Clerk Template package.json|Clerk Template: package.json]]
- [[_COMMUNITY_Collaborators API|Collaborators API]]
- [[_COMMUNITY_Project Detail API|Project Detail API]]
- [[_COMMUNITY_useProjectActions Hook|useProjectActions Hook]]
- [[_COMMUNITY_Projects List API|Projects List API]]
- [[_COMMUNITY_UI Card Component|UI: Card Component]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Auth Layout|Auth Layout]]
- [[_COMMUNITY_Clerk Middleware|Clerk Middleware]]
- [[_COMMUNITY_Clerk Skill api-specs script|Clerk Skill: api-specs script]]
- [[_COMMUNITY_Clerk Skill execute-request script|Clerk Skill: execute-request script]]
- [[_COMMUNITY_Clerk Skill extract-endpoint script|Clerk Skill: extract-endpoint script]]
- [[_COMMUNITY_Clerk Skill extract-tag script|Clerk Skill: extract-tag script]]
- [[_COMMUNITY_Clerk Template middleware|Clerk Template: middleware]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `compilerOptions` - 16 edges
3. `cn()` - 13 edges
4. `EditorProject` - 10 edges
5. `Button` - 8 edges
6. `useProjectActions()` - 7 edges
7. `POST()` - 6 edges
8. `tailwind` - 6 edges
9. `aliases` - 6 edges
10. `getEditorProjects()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `EditorPage()` --calls--> `getEditorProjects()`  [EXTRACTED]
  app/editor/page.tsx → lib/project-data.ts
- `ShapeConfig` --references--> `CanvasShape`  [EXTRACTED]
  components/editor/canvas/shape-panel.tsx → types/canvas.ts
- `ShapeVisualProps` --references--> `CanvasShape`  [EXTRACTED]
  components/editor/canvas/shape-visual.tsx → types/canvas.ts
- `EditorHomeProps` --inherits--> `EditorProjectLists`  [EXTRACTED]
  components/editor/editor-home.tsx → lib/project-types.ts
- `ProjectDialogsProps` --references--> `EditorProject`  [EXTRACTED]
  components/editor/project-dialogs.tsx → lib/project-types.ts

## Import Cycles
- None detected.

## Communities (32 total, 10 thin omitted)

### Community 0 - "Editor Home & Navbar"
Cohesion: 0.11
Nodes (31): EditorHomeProps, EditorNavbar(), EditorNavbarProps, ProjectDialogs(), ProjectDialogsProps, ProjectList(), ProjectSidebar(), ProjectSidebarProps (+23 more)

### Community 1 - "Canvas Editor (Nodes & Flow)"
Cohesion: 0.11
Nodes (22): CanvasFlow(), nodeTypes, CanvasNodeComponent(), CanvasWrapper(), CanvasWrapperProps, LiveblocksErrorBoundary, MinimapShape(), NodeColorToolbar() (+14 more)

### Community 2 - "Editor Pages & Liveblocks Auth"
Cohesion: 0.12
Nodes (17): POST(), EditorPage(), EditorWorkspacePage(), EditorWorkspacePageProps, AccessDenied(), CURSOR_COLORS, getCursorColor(), globalForLiveblocks (+9 more)

### Community 3 - "App Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, class-variance-authority, @clerk/nextjs, @clerk/ui, clsx, dotenv, @liveblocks/client, @liveblocks/node (+17 more)

### Community 4 - "Dev Dependencies & Scripts"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, tsx, @types/node, @types/pg (+14 more)

### Community 5 - "Clerk Template: tsconfig"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Project tsconfig"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "shadcn Components Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "Clerk Template: package.json"
Cohesion: 0.13
Nodes (14): dependencies, @clerk/nextjs, next, react, react-dom, devDependencies, @types/react, @types/react-dom (+6 more)

### Community 9 - "Collaborators API"
Cohesion: 0.33
Nodes (12): CollaboratorRow, CollaboratorsRouteContext, DELETE(), enrichCollaborators(), findProjectOwner(), GET(), getAuthenticatedUserId(), getUserEmails() (+4 more)

### Community 10 - "Project Detail API"
Cohesion: 0.42
Nodes (8): DELETE(), findProjectOwner(), getAuthenticatedUserId(), jsonError(), PATCH(), ProjectRouteContext, projectSelect, readRenameProjectBody()

### Community 11 - "useProjectActions Hook"
Cohesion: 0.28
Nodes (7): EditorHome(), WorkspaceShell(), createShortSuffix(), DialogType, slugify(), useProjectActions(), UseProjectActionsOptions

### Community 12 - "Projects List API"
Cohesion: 0.52
Nodes (6): GET(), getAuthenticatedUserId(), jsonError(), POST(), projectSelect, readCreateProjectBody()

### Community 13 - "UI: Card Component"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 14 - "Root Layout & Fonts"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

## Knowledge Gaps
- **150 isolated node(s):** `api-specs-context.sh script`, `execute-request.sh script`, `extract-endpoint-detail.sh script`, `extract-tag-endpoints.sh script`, `name` (+145 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Dev Dependencies & Scripts` to `Editor Pages & Liveblocks Auth`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Why does `prisma` connect `Editor Pages & Liveblocks Auth` to `Dev Dependencies & Scripts`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `dependencies` connect `App Dependencies` to `Dev Dependencies & Scripts`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `api-specs-context.sh script`, `execute-request.sh script`, `extract-endpoint-detail.sh script` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Editor Home & Navbar` be split into smaller, more focused modules?**
  _Cohesion score 0.10531400966183575 - nodes in this community are weakly interconnected._
- **Should `Canvas Editor (Nodes & Flow)` be split into smaller, more focused modules?**
  _Cohesion score 0.10756302521008404 - nodes in this community are weakly interconnected._
- **Should `Editor Pages & Liveblocks Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._