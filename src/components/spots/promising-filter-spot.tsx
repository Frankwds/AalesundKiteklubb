"use client"

import { useState, useMemo } from "react"
import { ChevronDown, CloudSun, Check } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getWeatherIconPath } from "@/lib/yr-forecast"
import type {
  PromisingFilterState,
  WeatherCondition,
} from "@/lib/promising-filter"
import {
  PROMISING_WEATHER_OPTIONS,
  getDefaultTimeRange,
  getDayLabel,
} from "@/lib/promising-filter"

const TIMEZONE = "Europe/Oslo"

interface PromisingFilterSpotProps {
  filter: PromisingFilterState | null
  onFilterChange: (filter: PromisingFilterState | null) => void
}

const HOUR_OPTIONS = Array.from({ length: 25 }, (_, i) => i)

export function PromisingFilterSpot({
  filter,
  onFilterChange,
}: PromisingFilterSpotProps) {
  const [open, setOpen] = useState(Boolean(filter))
  const now = useMemo(() => new Date(), [])

  const [localDay, setLocalDay] = useState<0 | 1 | 2>(
    filter?.selectedDay ?? 0
  )
  const [localTimeRange, setLocalTimeRange] = useState<[number, number]>(
    filter?.selectedTimeRange ?? getDefaultTimeRange(0, now)
  )
  const [localMinHours, setLocalMinHours] = useState(
    filter?.minPromisingHours ?? 2
  )
  const [localWeather, setLocalWeather] = useState<WeatherCondition[]>(
    filter?.selectedWeatherConditions ?? ([] as WeatherCondition[])
  )

  const minStartHour = localDay === 0 ? now.getHours() + 1 : 0
  const maxStartHour = 23
  const minEndHour = Math.max(minStartHour + 1, localTimeRange[0] + 1)

  const handleApply = () => {
    onFilterChange({
      selectedDay: localDay,
      selectedTimeRange: localTimeRange,
      minPromisingHours: localMinHours,
      selectedWeatherConditions: localWeather,
    })
    setOpen(false)
  }

  const handleReset = () => {
    setLocalDay(0)
    setLocalTimeRange(getDefaultTimeRange(0, now))
    setLocalMinHours(2)
    setLocalWeather([])
    onFilterChange(null)
    setOpen(false)
  }

  const handleDayChange = (day: 0 | 1 | 2) => {
    setLocalDay(day)
    setLocalTimeRange(getDefaultTimeRange(day, now))
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-primary" />
          Vis spots med lovende vær
          {filter && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              <Check className="h-3 w-3" />
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
          {/* Day tabs */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dag
            </p>
            <Tabs value={String(localDay)} onValueChange={(v) => handleDayChange(Number(v) as 0 | 1 | 2)}>
              <TabsList variant="default" className="w-full">
                <TabsTrigger value="0" className="flex-1">
                  {getDayLabel(0, now)}
                </TabsTrigger>
                <TabsTrigger value="1" className="flex-1">
                  {getDayLabel(1, now)}
                </TabsTrigger>
                <TabsTrigger value="2" className="flex-1">
                  {getDayLabel(2, now)}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Time range */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tidsrom
            </p>
            <div className="flex items-center gap-2">
              <select
                value={localTimeRange[0]}
                onChange={(e) =>
                  setLocalTimeRange([
                    Number(e.target.value),
                    Math.max(
                      Number(e.target.value) + 1,
                      localTimeRange[1]
                    ),
                  ])
                }
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
              >
                {HOUR_OPTIONS.filter((h) => h >= minStartHour && h <= maxStartHour).map(
                  (h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, "0")}:00
                    </option>
                  )
                )}
              </select>
              <span className="text-sm text-muted-foreground">–</span>
              <select
                value={localTimeRange[1]}
                onChange={(e) =>
                  setLocalTimeRange([localTimeRange[0], Number(e.target.value)])
                }
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
              >
                {HOUR_OPTIONS.filter(
                  (h) => h >= minEndHour && h > localTimeRange[0]
                ).map((h) => (
                  <option key={h} value={h}>
                    {h === 24 ? "24:00" : `${h.toString().padStart(2, "0")}:00`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Min consecutive hours */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Minst timer i strekk
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setLocalMinHours((h) => Math.max(1, h - 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center font-medium">
                {localMinHours}
              </span>
              <button
                type="button"
                onClick={() =>
                  setLocalMinHours((h) => Math.min(6, h + 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Weather conditions (optional) */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Værforhold{" "}
              <span className="font-normal normal-case text-muted-foreground/80">
                (valgfritt)
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {PROMISING_WEATHER_OPTIONS.map((opt) => {
                const isActive = localWeather.includes(opt.code)
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() =>
                      setLocalWeather((prev) =>
                        isActive
                          ? prev.filter((c) => c !== opt.code)
                          : [...prev, opt.code]
                      )
                    }
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/40"
                    )}
                  >
                    <Image
                      src={getWeatherIconPath(opt.code)}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px]"
                      unoptimized
                    />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Nullstill
            </button>
            <button
              onClick={handleApply}
              className="ml-auto rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Bruk filter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
