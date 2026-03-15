"use client"

import { useState } from "react"
import { ChevronDown, Wind, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminWindCompass } from "@/components/admin/AdminWindCompass"

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

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Wind className="h-4 w-4" />
          Filtre
          {hasActiveFilters && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-white">
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
            <AdminWindCompass
              selectedDirections={wind.map((d) => d.toLowerCase())}
              onWindDirectionChange={(dirs) =>
                onWindChange(dirs.map((d) => d.toUpperCase()))
              }
              className="w-40 h-40"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                onSeasonChange(null)
                onAreaChange(null)
                onWindChange([])
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
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
        "cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary-muted"
      )}
    >
      {children}
    </button>
  )
}
