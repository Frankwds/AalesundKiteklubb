"use client"

import { useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { SearchX } from "lucide-react"
import { SpotCard } from "./spot-card"
import { SpotFilters } from "./spot-filters"
import type { Database } from "@/types/database"

type Spot = Database["public"]["Tables"]["spots"]["Row"]

export function SpotList({ spots }: { spots: Spot[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const season = searchParams.get("season")
  const area = searchParams.get("area")
  const wind = searchParams.get("wind")?.split(",").filter(Boolean) ?? []

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [router, pathname])

  const filteredSpots = spots.filter((spot) => {
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

  const areas = [...new Set(spots.map((s) => s.area))].sort()

  return (
    <div className="space-y-6">
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

      {filteredSpots.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="text-base font-medium text-foreground">
              Ingen spotter matcher filtrene
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prøv å justere filtrene eller nullstill dem.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
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
