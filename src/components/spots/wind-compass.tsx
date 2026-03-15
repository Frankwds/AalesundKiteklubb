import { cn } from "@/lib/utils"

const DIRECTIONS = [
  { label: "N", deg: 0 },
  { label: "NE", deg: 45 },
  { label: "E", deg: 90 },
  { label: "SE", deg: 135 },
  { label: "S", deg: 180 },
  { label: "SW", deg: 225 },
  { label: "W", deg: 270 },
  { label: "NW", deg: 315 },
] as const

const CX = 50
const CY = 50
const RING_R = 30
const DOT_R = 3.5
const LABEL_R = 42
const LINE_INNER_R = 8

function toRad(compassDeg: number) {
  return ((compassDeg - 90) * Math.PI) / 180
}

interface WindCompassProps {
  directions: string[]
  size?: "sm" | "lg"
}

export function WindCompass({ directions, size = "sm" }: WindCompassProps) {
  const active = new Set(directions.map((d) => d.toUpperCase()))

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn(
        "flex-shrink-0",
        size === "sm" ? "h-20 w-20" : "h-44 w-44"
      )}
      aria-label={`Vindretninger: ${directions.join(", ") || "ingen"}`}
    >
      <circle
        cx={CX}
        cy={CY}
        r={RING_R}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={1}
        className="text-border"
      />
      <circle cx={CX} cy={CY} r={2} fill="currentColor" className="text-muted-foreground" fillOpacity={0.5} />

      {DIRECTIONS.map(({ label, deg }) => {
        const rad = toRad(deg)
        const isActive = active.has(label)

        const dotX = CX + RING_R * Math.cos(rad)
        const dotY = CY + RING_R * Math.sin(rad)
        const labelX = CX + LABEL_R * Math.cos(rad)
        const labelY = CY + LABEL_R * Math.sin(rad)
        const lineX = CX + LINE_INNER_R * Math.cos(rad)
        const lineY = CY + LINE_INNER_R * Math.sin(rad)

        return (
          <g key={label}>
            <line
              x1={lineX}
              y1={lineY}
              x2={dotX}
              y2={dotY}
              stroke={isActive ? "#132a45" : "#e5e7eb"}
              strokeWidth={isActive ? 1.5 : 0.75}
            />
            <circle
              cx={dotX}
              cy={dotY}
              r={isActive ? DOT_R : DOT_R * 0.7}
              fill={isActive ? "#132a45" : "#d1d5db"}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={deg % 90 === 0 ? 8 : 6.5}
              fontWeight={deg % 90 === 0 ? 600 : 400}
              fill={isActive ? "#132a45" : "#9ca3af"}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
