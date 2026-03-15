"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { SearchX, Loader2 } from "lucide-react"
import { SpotCard } from "./spot-card"
import { SpotFilters } from "./spot-filters"
import { PromisingFilterSpot } from "./promising-filter-spot"
import {
  fetchYrDataClient,
  mapYrToMinimalForecast,
  type MinimalForecast,
} from "@/lib/yr-forecast"
import {
  spotPassesPromisingFilter,
  type PromisingFilterState,
} from "@/lib/promising-filter"
import type { Database } from "@/types/database"

type Spot = Database["public"]["Tables"]["spots"]["Row"]

const forecastCache = new Map<string, MinimalForecast[]>()

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`
}

async function getForecast(
  lat: number,
  lon: number
): Promise<MinimalForecast[]> {
  const key = cacheKey(lat, lon)
  const cached = forecastCache.get(key)
  if (cached) return cached
  const raw = await fetchYrDataClient(lat, lon)
  const forecast = mapYrToMinimalForecast(raw)
  forecastCache.set(key, forecast)
  return forecast
}

function parseFiltersFromSearchParams(searchParams: URLSearchParams) {
  return {
    season: searchParams.get("season"),
    area: searchParams.get("area"),
    wind: searchParams.get("wind")?.split(",").filter(Boolean) ?? [] as string[],
  }
}

export function SpotList({ spots }: { spots: Spot[] }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [filters, setFilters] = useState(() =>
    parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString()))
  )
  const [promisingFilter, setPromisingFilter] =
    useState<PromisingFilterState | null>(null)
  const [promisingSpotIds, setPromisingSpotIds] = useState<Set<string> | null>(
    null
  )
  const [loadingPromising, setLoadingPromising] = useState(false)

  const { season, area, wind } = filters

  const eligibleForPromising = useMemo(
    () =>
      spots.filter(
        (s) =>
          s.latitude != null &&
          s.longitude != null &&
          s.wind_directions &&
          s.wind_directions.length > 0
      ),
    [spots]
  )

  useEffect(() => {
    if (!promisingFilter || eligibleForPromising.length === 0) {
      setPromisingSpotIds(null)
      return
    }

    let cancelled = false
    setLoadingPromising(true)
    setPromisingSpotIds(null)

    const run = async () => {
      const passing = new Set<string>()
      for (const spot of eligibleForPromising) {
        if (cancelled) return
        try {
          const forecast = await getForecast(spot.latitude!, spot.longitude!)
          if (
            spotPassesPromisingFilter(
              forecast,
              spot.wind_directions,
              promisingFilter
            )
          ) {
            passing.add(spot.id)
          }
        } catch {
          // Skip spot on fetch error
        }
      }
      if (!cancelled) {
        setPromisingSpotIds(passing)
      }
      setLoadingPromising(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [promisingFilter, eligibleForPromising])

  // Sync state when user navigates via browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setFilters(
        parseFiltersFromSearchParams(new URLSearchParams(window.location.search))
      )
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      setFilters((prev) => {
        const next = { ...prev }
        if (key === "wind") {
          next.wind = value ? value.split(",").filter(Boolean) : []
        } else {
          ;(next as unknown as Record<string, string | null>)[key] = value
        }
        return next
      })
      const params = new URLSearchParams(window.location.search)
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const qs = params.toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      window.history.replaceState(null, "", url)
    },
    [pathname]
  )

  const clearFilters = useCallback(() => {
    setFilters({ season: null, area: null, wind: [] })
    setPromisingFilter(null)
    window.history.replaceState(null, "", pathname)
  }, [pathname])

  const baseFilteredSpots = spots.filter((spot) => {
    if (season && spot.season !== season) return false
    if (area && spot.area !== area) return false
    if (
      wind.length > 0 &&
      (!spot.wind_directions ||
        !wind.some((w) => spot.wind_directions!.includes(w)))
    )
      return false
    return true
  })

  const filteredSpots =
    promisingFilter && promisingSpotIds
      ? baseFilteredSpots.filter((s) => promisingSpotIds.has(s.id))
      : baseFilteredSpots

  const areas = [...new Set(spots.map((s) => s.area))].sort()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-start">
        <SpotFilters
          season={season}
          area={area}
          wind={wind}
          areas={areas}
          onSeasonChange={(v) => setFilter("season", v)}
          onAreaChange={(v) => setFilter("area", v)}
          onWindChange={(dirs) =>
            setFilter("wind", dirs.length ? dirs.join(",") : null)
          }
        />
        <PromisingFilterSpot
          filter={promisingFilter}
          onFilterChange={setPromisingFilter}
        />
      </div>

      {loadingPromising && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sjekker værforhold …
        </div>
      )}

      {filteredSpots.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="text-base font-medium text-foreground">
              Ingen spot guide matcher filtrene
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prøv å justere filtrene eller nullstill dem.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Nullstill filtre
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  )
}
