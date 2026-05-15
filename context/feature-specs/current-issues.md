We have implemented the feature 08-editor-workspace-shell.md  

But now when I:

## Create new project

- form '/editor' i get this error 
- DELETE /api/projects/my-system-design-221v6v 200 in 5.2s (next.js: 556ms, proxy.ts: 13ms, application-code: 4.7s)
⨯ Error [PrismaClientKnownRequestError]:
Invalid `{imported module ./lib/prisma.ts}["prisma"].project.findMany()` invocation in
/home/vaibh/ghost-ai/ghost-ai/.next/dev/server/chunks/ssr/[root-of-the-server]__007jtot._.js:390:161        

  387     },
  388     select: editorProjectSelect
  389 }),
→ 390 userEmails.length > 0 ? {imported module ./lib/prisma.ts}["prisma"].project.findMany(

    at <unknown> (lib/project-data.ts:41:24)
    at async getEditorProjects (lib/project-data.ts:34:43)
    at async EditorPage (app/editor/page.tsx:5:24)
  39 | ...
  40 | ...ls.length > 0
> 41 | ...ma.project.findMany({     
     |               ^
  42 | ...ere: {
  43 | ...ownerId: { not: userId }, 
  44 | ...collaborators: { {        
  code: 'ETIMEDOUT',
  meta: { modelName: 'Project' },   
  clientVersion: '7.8.0',
  digest: '3218799563'
}
 GET /editor 200 in 2.2s 

## And Delete one 

- [browser] Uncaught PrismaClientKnownRequestError:
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].project.findMany()` invocation in
/home/vaibh/ghost-ai/ghost-ai/.next/dev/server/chunks/ssr/[root-of-the-server]__007jtot._.js:390:161        

  387     },
  388     select: editorProjectSelect
  389 }),
→ 390 userEmails.length > 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].project.findMany(

    at <unknown> (lib/project-data.ts:41:24)
    at Function.all (<anonymous>:1:21)
  39 | ...
  40 | ...ls.length > 0
> 41 | ...ma.project.findMany({
     |               ^
  42 | ...ere: {
  43 | ...ownerId: { not: userId },
  44 | ...collaborators: {
 GET /sw.js 404 in 57ms (next.js: 7ms, application-code: 50ms)
 GET /sw.js 404 in 42ms (next.js: 7ms, application-code: 35ms)
^C