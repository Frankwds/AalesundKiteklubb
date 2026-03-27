/**
 * Wind-sector map pin DOM (WindLord / WindAlert pattern).
 * AdvancedMarkerElement content: 40×40 SVG arcs + larger center image in a 32×32 container.
 */

const CONTAINER_PX = 32
/** Emblem only; wind ring SVG stays 40×40. */
const ICON_PX = 48
const ICON_INSET = (CONTAINER_PX - ICON_PX) / 2
/** Nudge emblem vs. ring (negative = left). */
const ICON_OFFSET_X_PX = -2

const DIRECTION_ORDER = [
  { name: "n", angle: -90 },
  { name: "ne", angle: -45 },
  { name: "e", angle: 0 },
  { name: "se", angle: 45 },
  { name: "s", angle: 90 },
  { name: "sw", angle: 135 },
  { name: "w", angle: 180 },
  { name: "nw", angle: -135 },
] as const

export function windDirectionsToSymbols(
  directions: string[] | null | undefined
): string[] {
  if (!directions?.length) return []
  const seen = new Set<string>()
  for (const d of directions) {
    const s = d.trim().toLowerCase()
    if (s) seen.add(s)
  }
  return Array.from(seen)
}

function createDirectionCircle(directionSymbols: string[]): SVGElement {
  const svgNS = "http://www.w3.org/2000/svg"
  const svg = document.createElementNS(svgNS, "svg")
  svg.setAttribute("width", "40")
  svg.setAttribute("height", "40")
  svg.setAttribute("viewBox", "0 0 40 40")
  svg.style.userSelect = "none"

  const radius = 16
  const strokeWidth = 5
  const center = 20

  const getArcPath = (startAngle: number, endAngle: number) => {
    const start = {
      x: center + radius * Math.cos((startAngle * Math.PI) / 180),
      y: center + radius * Math.sin((startAngle * Math.PI) / 180),
    }
    const end = {
      x: center + radius * Math.cos((endAngle * Math.PI) / 180),
      y: center + radius * Math.sin((endAngle * Math.PI) / 180),
    }
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`
  }

  const allowed = new Set(directionSymbols)
  for (const { name, angle } of DIRECTION_ORDER) {
    if (!allowed.has(name)) continue
    const path = document.createElementNS(svgNS, "path")
    path.setAttribute("d", getArcPath(angle - 20, angle + 20))
    path.setAttribute("stroke", "rgb(0, 128, 0)")
    path.setAttribute("stroke-width", strokeWidth.toString())
    path.setAttribute("fill", "none")
    svg.appendChild(path)
  }

  return svg
}

/** Pin graphic shown on top of the wind ring (club emblem). */
const SPOT_MARKER_ICON_SRC = "/logo-emblem-transparent.png"

export function createSpotMarkerElement(
  windDirections: string[] | null | undefined
): HTMLElement {
  const container = document.createElement("div")
  container.style.position = "relative"
  container.style.width = `${CONTAINER_PX}px`
  container.style.height = `${CONTAINER_PX}px`
  container.style.userSelect = "none"
  container.style.transform = "translate(0%, 50%)"
  container.style.cursor = "pointer"

  const symbols = windDirectionsToSymbols(windDirections)
  const svg = createDirectionCircle(symbols)
  svg.style.position = "absolute"
  svg.style.top = "-4px"
  svg.style.left = "-4px"
  svg.style.zIndex = "0"

  const img = document.createElement("img")
  img.src = SPOT_MARKER_ICON_SRC
  img.alt = ""
  img.style.position = "absolute"
  img.style.top = `${ICON_INSET}px`
  img.style.left = `${ICON_INSET + ICON_OFFSET_X_PX}px`
  img.style.width = `${ICON_PX}px`
  img.style.height = `${ICON_PX}px`
  img.style.objectFit = "contain"
  img.style.zIndex = "1"
  img.draggable = false
  img.style.userSelect = "none"
  img.style.pointerEvents = "none"

  container.appendChild(svg)
  container.appendChild(img)

  return container
}

export function attachSpotMarkerHoverHandlers(markerElement: HTMLElement): void {
  markerElement.addEventListener("mouseenter", () => {
    markerElement.style.transform = "scale(1.1) translate(0%, 45%)"
  })
  markerElement.addEventListener("mouseleave", () => {
    markerElement.style.transform = "scale(1) translate(0%, 50%)"
  })
}
