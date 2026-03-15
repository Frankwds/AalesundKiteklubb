"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, X, MapPin, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const spots = [
  {
    id: "giske-nordvest",
    name: "Giske Nordvest",
    area: "Giske",
    season: "sommer" as const,
    skillLevel: "nybegynner" as const,
    windDirections: ["SV", "V", "NV"],
  },
  {
    id: "alnes",
    name: "Alnes",
    area: "Giske",
    season: "sommer" as const,
    skillLevel: "erfaren" as const,
    windDirections: ["N", "NV", "V"],
  },
  {
    id: "mauseidvag",
    name: "Mauseidvåg",
    area: "Ålesund",
    season: "vinter" as const,
    skillLevel: "nybegynner" as const,
    windDirections: ["S", "SØ", "Ø"],
  },
  {
    id: "vigra-nord",
    name: "Vigra Nord",
    area: "Vigra",
    season: "sommer" as const,
    skillLevel: "erfaren" as const,
    windDirections: ["N", "NØ"],
  },
  {
    id: "hareid-strand",
    name: "Hareid Strand",
    area: "Hareid",
    season: "vinter" as const,
    skillLevel: "nybegynner" as const,
    windDirections: ["S", "SV", "V"],
  },
  {
    id: "giske-sor",
    name: "Giske Sør",
    area: "Giske",
    season: "sommer" as const,
    skillLevel: "erfaren" as const,
    windDirections: ["S", "SØ"],
  },
]

const areas = ["Giske", "Ålesund", "Vigra", "Hareid"]
const windDirectionsAll = ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"]

export default function SpotsPage() {
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [seasonFilter, setSeasonFilter] = useState<"sommer" | "vinter" | null>(null)
  const [areaFilter, setAreaFilter] = useState<string | null>(null)
  const [windFilter, setWindFilter] = useState<string[]>([])

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (seasonFilter && spot.season !== seasonFilter) return false
      if (areaFilter && spot.area !== areaFilter) return false
      if (windFilter.length > 0 && !windFilter.some((w) => spot.windDirections.includes(w))) return false
      return true
    })
  }, [seasonFilter, areaFilter, windFilter])

  const clearFilters = () => {
    setSeasonFilter(null)
    setAreaFilter(null)
    setWindFilter([])
  }

  const hasActiveFilters = seasonFilter || areaFilter || windFilter.length > 0

  const toggleWindDirection = (dir: string) => {
    setWindFilter((prev) =>
      prev.includes(dir) ? prev.filter((d) => d !== dir) : [...prev, dir]
    )
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Spot guide</h1>

      {/* Filter Section */}
      <div className="mb-8">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 text-sm font-medium text-foreground mb-4 hover:text-sky-600 transition-colors"
        >
          Filtrer spot guide
          {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {filtersOpen && (
          <div className="bg-white rounded-lg border border-border p-4 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Season filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Sesong</label>
                <div className="flex gap-2">
                  <Button
                    variant={seasonFilter === "sommer" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSeasonFilter(seasonFilter === "sommer" ? null : "sommer")}
                    className={cn(
                      seasonFilter === "sommer" && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    Sommer
                  </Button>
                  <Button
                    variant={seasonFilter === "vinter" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSeasonFilter(seasonFilter === "vinter" ? null : "vinter")}
                    className={cn(
                      seasonFilter === "vinter" && "bg-sky-600 hover:bg-sky-700"
                    )}
                  >
                    Vinter
                  </Button>
                </div>
              </div>

              {/* Area filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Område</label>
                <div className="flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <Button
                      key={area}
                      variant={areaFilter === area ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAreaFilter(areaFilter === area ? null : area)}
                      className={cn(
                        areaFilter === area && "bg-sky-600 hover:bg-sky-700"
                      )}
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Wind direction filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Vindretning</label>
                <div className="flex flex-wrap gap-2">
                  {windDirectionsAll.map((dir) => (
                    <Button
                      key={dir}
                      variant={windFilter.includes(dir) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleWindDirection(dir)}
                      className={cn(
                        "min-w-[40px]",
                        windFilter.includes(dir) && "bg-sky-600 hover:bg-sky-700"
                      )}
                    >
                      {dir}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Nullstill filtre
              </button>
            )}
          </div>
        )}
      </div>

      {/* Spots Grid */}
      {filteredSpots.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Ingen spot guide matcher filtrene dine.</p>
          <Button onClick={clearFilters} variant="outline">
            Nullstill filtre
          </Button>
        </div>
      )}
    </div>
  )
}

function SpotCard({ spot }: { spot: typeof spots[0] }) {
  return (
    <Link href={`/spots/${spot.id}`}>
      <Card className="h-full hover:shadow-md hover:border-sky-300 transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-foreground">{spot.name}</h3>
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {spot.area}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              className={cn(
                "text-xs",
                spot.season === "sommer"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-sky-100 text-sky-800 hover:bg-sky-100"
              )}
            >
              {spot.season === "sommer" ? "Sommer" : "Vinter"}
            </Badge>
            <Badge
              className={cn(
                "text-xs",
                spot.skillLevel === "nybegynner"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-orange-100 text-orange-800 hover:bg-orange-100"
              )}
            >
              {spot.skillLevel === "nybegynner" ? "Nybegynner" : "Erfaren"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {spot.windDirections.map((dir) => (
                <Badge key={dir} variant="secondary" className="text-xs px-2">
                  {dir}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
