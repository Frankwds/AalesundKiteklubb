/**
 * Display-only wind compass (WindAlert SVG pie-chart design).
 * Shows suitable wind directions for a spot. Uses the same green as admin spot form.
 * Directions: lowercase ['n','ne','e','se','s','sw','w','nw']; accepts uppercase from API.
 */

const DIRECTIONS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const
const numSegments = DIRECTIONS.length
const angleStep = 360 / numSegments

const SUITABLE_FILL = "oklch(0.55 0.1 145)" // Same green as AdminWindCompass

function getPath(index: number, radius: number, center: number) {
  const startAngle = -angleStep / 2 + index * angleStep - 90
  const endAngle = angleStep / 2 + index * angleStep - 90
  const start = {
    x: center + radius * Math.cos((startAngle * Math.PI) / 180),
    y: center + radius * Math.sin((startAngle * Math.PI) / 180),
  }
  const end = {
    x: center + radius * Math.cos((endAngle * Math.PI) / 180),
    y: center + radius * Math.sin((endAngle * Math.PI) / 180),
  }
  return `M ${center},${center} L ${start.x},${start.y} A ${radius},${radius} 0 0,1 ${end.x},${end.y} Z`
}

function getTextPosition(index: number, radius: number, center: number) {
  const angle = index * angleStep - 90
  return {
    x: center + (radius - 20) * Math.cos((angle * Math.PI) / 180),
    y: center + (radius - 20) * Math.sin((angle * Math.PI) / 180),
  }
}

function normalizeDirections(directions: string[]): string[] {
  return directions.map((d) => d.toLowerCase())
}

interface WindCompassProps {
  directions: string[]
  size?: "sm" | "lg"
}

export function WindCompass({ directions, size = "sm" }: WindCompassProps) {
  const allowed = new Set(normalizeDirections(directions))

  if (size === "sm") {
    return (
      <TinyWindCompass allowedDirections={Array.from(allowed)} />
    )
  }

  return (
    <StandardWindCompass allowedDirections={Array.from(allowed)} />
  )
}

/** Standard display: with labels. For spot detail page. */
function StandardWindCompass({ allowedDirections }: { allowedDirections: string[] }) {
  const radius = 100
  const center = 105

  return (
    <svg
      viewBox="0 0 210 210"
      className="w-32 h-32 md:w-48 md:h-48 mb-4 flex-shrink-0"
      aria-label={`Passende vindretninger: ${allowedDirections.join(", ") || "ingen"}`}
    >
      {DIRECTIONS.map((dir, index) => {
        const isAllowed = allowedDirections.includes(dir)
        const textPos = getTextPosition(index, radius, center)
        return (
          <g key={dir}>
            <path
              d={getPath(index, radius, center)}
              fill={isAllowed ? SUITABLE_FILL : "var(--border)"}
              stroke="var(--background)"
              strokeWidth={1}
            />
            <text
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--foreground)"
              className="text-base font-sans"
            >
              {dir.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Tiny display: no labels. For spot cards. */
function TinyWindCompass({ allowedDirections }: { allowedDirections: string[] }) {
  const radius = 20
  const center = 22

  return (
    <svg
      viewBox="0 0 44 44"
      className="w-24 h-24 flex-shrink-0"
      aria-label={`Passende vindretninger: ${allowedDirections.join(", ") || "ingen"}`}
    >
      {DIRECTIONS.map((dir, index) => {
        const isAllowed = allowedDirections.includes(dir)
        return (
          <path
            key={dir}
            d={getPath(index, radius, center)}
            fill={isAllowed ? SUITABLE_FILL : "var(--border)"}
            stroke="var(--background)"
            strokeWidth={1}
          />
        )
      })}
    </svg>
  )
}
