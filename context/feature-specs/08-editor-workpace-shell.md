Build the '/editor/[roomId]' workspace shell with with server-side access checks. No canvas logic yet.

## Access 

'/editor/[roomId]' must be a server component.

Before  rendering:

- unauthenticated users redirect to '/sign-in'
- users without project access see 'AccessDenied'
- non-existenet projects also shwo 'AccessDenied'

Create 'compponents/editor/access-denied.tsx' with:

- centered layout 
- lock icon
- short message 
- link  back to '/editor'

## Access  Helpers

Create 'lib/project-access.ts' with helpers for:

- grtting current Clerk identity: 'userId' + primary email
- checking project access by owner or collaborator

## Layout 

Build a full-viewport workspace layout with:

- top nav bar showing the project name 
- navbar actions: share button and AI sidebar toggle 
- existing 'ProjectSidebar' on the left
- current room highlighted in sidebar
- central canvas placeholder with dark background and centered message
-  right sidebar placeholder for future AI chat

The canvas area should fill the remaining space.

## Scope

Do not add real canvas logic, Liveblocks, AI chat, or sharing behaviour yet

## Check when Done

- '/editor/[roomId]' builds successfully 
- access helper exists outside the page compinent
- ' AccessDenied' is used for missing or unauthorised projects
- workspace layout renders with current project context 
- no TypeScript errors