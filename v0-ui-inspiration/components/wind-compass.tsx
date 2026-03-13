"use client"

import { cn } from "@/lib/utils"

const directions = [
  { label: "N", angle: 0 },
  { label: "NØ", angle: 45 },
  { label: "Ø", angle: 90 },
  { label: "SØ", angle: 135 },
  { label: "S", angle: 180 },
  { label: "SV", angle: 225 },
  { label: "V", angle: 270 },
  { label: "NV", angle: 315 },
]

interface WindCompassProps {
  activeDirections: string[]
  size?: number
}

export function WindCompass({ activeDirections, size = 200 }: WindCompassProps) {
  const center = size / 2
  const radius = size / 2 - 30

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="text-foreground">
        {/* Outer circle */}
        <circle
          cx={center}
          cy={center}
          r={radius + 15}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />
        
        {/* Inner circle */}
        <circle
          cx={center}
          cy={center}
          r={radius - 15}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
        />

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={4}
          fill="currentColor"
          className="text-muted-foreground"
        />

        {/* Direction markers */}
        {directions.map(({ label, angle }) => {
          const isActive = activeDirections.includes(label)
          const radian = (angle - 90) * (Math.PI / 180)
          const x = center + Math.cos(radian) * radius
          const y = center + Math.sin(radian) * radius

          // Line from center to direction
          const lineEndX = center + Math.cos(radian) * (radius - 25)
          const lineEndY = center + Math.sin(radian) * (radius - 25)

          return (
            <g key={label}>
              {/* Direction line */}
              <line
                x1={center}
                y1={center}
                x2={lineEndX}
                y2={lineEndY}
                stroke="currentColor"
                strokeWidth={isActive ? 2 : 1}
                className={cn(
                  isActive ? "text-sky-600" : "text-border"
                )}
              />
              
              {/* Direction circle */}
              <circle
                cx={x}
                cy={y}
                r={18}
                fill={isActive ? "rgb(2, 132, 199)" : "transparent"}
                stroke={isActive ? "rgb(2, 132, 199)" : "currentColor"}
                strokeWidth="2"
                className={cn(!isActive && "text-border")}
              />
              
              {/* Direction label */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight={isActive ? "600" : "400"}
                fill={isActive ? "white" : "currentColor"}
                className={cn(!isActive && "text-muted-foreground")}
              >
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
