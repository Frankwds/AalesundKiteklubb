"use client"

import { useState } from "react"
import { ChevronDown, Wind, X } from "lucide-react"
import { cn } from "@/lib/utils"

const ALL_DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const

interface SpotFiltersProps {
  season: string | null
  area: string | null
  wind: string[]
  areas: string[]
  onSeasonChange: (value: string | null) => void
  onAreaChange: (value: string | null) => void
  onWindChange: (directions: string[]) => void
}

export function SpotFilters({
  season,
  area,
  wind,
  areas,
  onSeasonChange,
  onAreaChange,
  onWindChange,
}: SpotFiltersProps) {
  const [open, setOpen] = useState(
    Boolean(season || area || wind.length > 0)
  )

  const hasActiveFilters = Boolean(season || area || wind.length > 0)

  function toggleWind(dir: string) {
    onWindChange(
      wind.includes(dir) ? wind.filter((d) => d !== dir) : [...wind, dir]
    )
  }

  return (
    <div className="rounded-lg border border-border bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Wind className="h-4 w-4" />
          Filtre
          {hasActiveFilters && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 text-xs font-medium text-white">
              {[season, area, wind.length > 0 ? "w" : null].filter(Boolean).length}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-5">
          {/* Season */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sesong
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterToggle
                active={season === "summer"}
                onClick={() => onSeasonChange(season === "summer" ? null : "summer")}
              >
                Sommer
              </FilterToggle>
              <FilterToggle
                active={season === "winter"}
                onClick={() => onSeasonChange(season === "winter" ? null : "winter")}
              >
                Vinter
              </FilterToggle>
            </div>
          </div>

          {/* Area */}
          {areas.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Område
              </p>
              <div className="flex flex-wrap gap-2">
                {areas.map((a) => (
                  <FilterToggle
                    key={a}
                    active={area === a}
                    onClick={() => onAreaChange(area === a ? null : a)}
                  >
                    {a}
                  </FilterToggle>
                ))}
              </div>
            </div>
          )}

          {/* Wind directions */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vindretning
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_DIRECTIONS.map((dir) => (
                <FilterToggle
                  key={dir}
                  active={wind.includes(dir)}
                  onClick={() => toggleWind(dir)}
                >
                  {dir}
                </FilterToggle>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                onSeasonChange(null)
                onAreaChange(null)
                onWindChange([])
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Nullstill filtre
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FilterToggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-sky-600 bg-sky-600 text-white"
          : "border-border bg-white text-foreground hover:border-sky-300 hover:bg-sky-50"
      )}
    >
      {children}
    </button>
  )
}
