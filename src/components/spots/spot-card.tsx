import Link from "next/link"
import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WindCompass } from "./wind-compass"
import { seasonLabels, skillLabels } from "@/lib/spot-labels"
import type { Database } from "@/types/database"

type Spot = Database["public"]["Tables"]["spots"]["Row"]

export function SpotCard({ spot }: { spot: Spot }) {
  const season = spot.season ? seasonLabels[spot.season] : null
  const skill = spot.skill_level ? skillLabels[spot.skill_level] : null

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md card-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {spot.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{spot.area}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {season && (
              <Badge variant={season.variant}>{season.text}</Badge>
            )}
            {skill && (
              <Badge variant={skill.variant}>{skill.text}</Badge>
            )}
          </div>
        </div>

        {spot.wind_directions && spot.wind_directions.length > 0 && (
          <WindCompass directions={spot.wind_directions} size="sm" />
        )}
      </div>
    </Link>
  )
}
