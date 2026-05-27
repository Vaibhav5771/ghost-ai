"use client"

import type { MiniMapNodeProps } from "@xyflow/react"
import { useNodesData } from "@xyflow/react"

import type { CanvasNode, CanvasShape } from "@/types/canvas"

export function MinimapShape({
  id,
  x,
  y,
  width,
  height,
  color,
  strokeColor,
  strokeWidth,
  shapeRendering,
  selected,
  onClick,
}: MiniMapNodeProps) {
  const node = useNodesData<CanvasNode>(id)
  const shape: CanvasShape = node?.data?.shape ?? "rectangle"

  const fill = color ?? "oklch(0.7 0 0)"
  const stroke = strokeColor ?? "transparent"
  const sw = strokeWidth ?? 2
  const common = {
    fill,
    stroke,
    strokeWidth: sw,
    shapeRendering,
    onClick: onClick ? (e: React.MouseEvent) => onClick(e, id) : undefined,
    style: selected ? { opacity: 1 } : undefined,
  }

  if (shape === "rectangle") {
    return <rect x={x} y={y} width={width} height={height} rx={5} {...common} />
  }

  if (shape === "pill") {
    return (
      <rect x={x} y={y} width={width} height={height} rx={height / 2} {...common} />
    )
  }

  if (shape === "circle") {
    return (
      <ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        rx={width / 2}
        ry={height / 2}
        {...common}
      />
    )
  }

  if (shape === "diamond") {
    const cx = x + width / 2
    const cy = y + height / 2
    const points = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`
    return <polygon points={points} {...common} />
  }

  if (shape === "hexagon") {
    const px = (frac: number) => x + width * frac
    const py = (frac: number) => y + height * frac
    const points = [
      `${px(0.25)},${py(0.03)}`,
      `${px(0.75)},${py(0.03)}`,
      `${px(0.97)},${py(0.5)}`,
      `${px(0.75)},${py(0.97)}`,
      `${px(0.25)},${py(0.97)}`,
      `${px(0.03)},${py(0.5)}`,
    ].join(" ")
    return <polygon points={points} {...common} />
  }

  // cylinder
  const ry = height * 0.12
  const cx = x + width / 2
  const rx = width / 2
  const top = y + ry
  const bottom = y + height - ry
  const body = `M ${x},${top} L ${x},${bottom} A ${rx},${ry} 0 0 0 ${x + width},${bottom} L ${x + width},${top} A ${rx},${ry} 0 0 1 ${x},${top} Z`
  return (
    <>
      <path d={body} {...common} />
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} {...common} />
    </>
  )
}
