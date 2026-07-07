Replace the placeholder node renderer with proper shape rendering and a drag preview.

## Implementation 

1. Replace the placeholder node shape rendering.
    - rectangle, pill, and circle should use CSS styling
    - diamond, hexagon, and cylinder should render with svg shapes
    - SVG shapes should scale with node size
    - keep borders subtle at rest and brighter when selected

2. Add a shape drag preview.
    - when dragging a shape from the shape panel, show a ghost preview of that shape
    - keep the preview attached to the cursor while draggong
    - use the same shape type default size that will be used on drop
    - hide preview after the shape is dropped or the drag is cancelled
    - keep this limited to drag preview behaviour only

3. Keep node rendering connected to the existing collaborative canvas state.

## Scope Limits

- don't rebuilt shape panel layout
- don't change how dropped nodes are created
- don't add resize or label editing yet
- keep drag/drop changes limited to the ghost preview only

## Check When Done

- Node render the correct shape varient for each type.
- CSS shapes render correctly for rectangle, pill, and circle.
- SVG shapes render and scale correctly for diamond, hexagon, and cylinder.
- Shapes dragging shows a ghost preview matching the dragged shape.
- 'npm eun build' passes without type errors.