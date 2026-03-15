"use client"

/**
 * Always-expanded interactive wind compass for admin forms.
 * Click wedges to select/deselect suitable wind directions.
 * Uses WindAlert SVG pie-chart design. Directions: lowercase ['n','ne','e','se','s','sw','w','nw'].
 */

const DIRECTIONS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const
const numSegments = DIRECTIONS.length
const angleStep = 360 / numSegments

const radius = 60
const center = 65

function getPath(index: number) {
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

function getTextPosition(index: number) {
  const angle = index * angleStep - 90
  return {
    x: center + (radius - 20) * Math.cos((angle * Math.PI) / 180),
    y: center + (radius - 20) * Math.sin((angle * Math.PI) / 180),
  }
}

export interface AdminWindCompassProps {
  selectedDirections: string[]
  onWindDirectionChange: (directions: string[]) => void
  /** Optional size override. Default: w-48 h-48 */
  className?: string
}

export function AdminWindCompass({
  selectedDirections,
  onWindDirectionChange,
  className = "w-48 h-48",
}: AdminWindCompassProps) {
  const normalized = selectedDirections.map((d) => d.toLowerCase())
  const selected = new Set(normalized)

  function handleDirectionClick(dir: string) {
    const newSelected = selected.has(dir)
      ? normalized.filter((d) => d !== dir)
      : [...normalized, dir]
    onWindDirectionChange(newSelected)
  }

  return (
    <svg
      viewBox="0 0 130 130"
      className={`${className} touch-none select-none`}
      aria-label="Velg passende vindretninger"
    >
      {DIRECTIONS.map((dir, index) => {
        const isSelected = selected.has(dir)
        const textPos = getTextPosition(index)
        return (
          <g key={dir}>
            <path
              d={getPath(index)}
              fill={isSelected ? "oklch(0.55 0.1 145)" : "var(--border)"}
              stroke="var(--background)"
              strokeWidth={1}
              className="cursor-pointer transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => handleDirectionClick(dir)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleDirectionClick(dir)
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              aria-label={`${dir.toUpperCase()} ${isSelected ? "valgt" : "ikke valgt"}`}
            />
            <text
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--foreground)"
              className="text-sm font-sans pointer-events-none"
            >
              {dir.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
