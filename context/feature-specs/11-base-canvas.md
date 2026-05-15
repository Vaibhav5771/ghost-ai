Replace the canvas placeholder with a :iveblocks-backed React Flow canvas.

## Implementation

1. Keep the workspace page server-side.

2. Create a client-side editor/canvas wrapper that sets up the Liveblocks room.

    It should include:
    - 'LiveblocksProvider' using '/api/liveblocks-auth'
    - 'RoomProvider' using the current room ID
    - Initial presense with 'cursor: null'
    - 'ClinetSideSuspense' with simple loading state
    - an error fallback for Liveblocks connection issues

3. Wire React Flow to Liveblocks state.
    - use 'useLiveblocksFlow'
    - enable suspense
    - start with empty nodes and edges
    - pass the synced nodes, edges, and change handlesrs into 'ReactFlow'

4. Add shared canvas types in 'types/canvas.ts'.

    Node data should suppot:
    - label 
    - color
    - shape 

    also define the custom node and edge types: 
    - 'canvasNode'
    - 'canvasEdge'

5. Render the basic canvas.

    Include: 
    - loose connection behaviour 
    - 'fitView'
    - 'MiniMap'
    - dot-pattern background

## Scope Limits

- don't add controls yet
- don't add custom node or edgee rendering yet
- don't add persistance logic
- don't add AI behaviout
- keep this focused on the collabarative canvas foundation

## Check When Done

- Client canvas weapper sets up the Liveblocks room.
- React Flow uses Liveblocks-synced nodes and edges.
- Shared canvas types exist in 'types/canvas.ts'.
- 'npm run build' passes.