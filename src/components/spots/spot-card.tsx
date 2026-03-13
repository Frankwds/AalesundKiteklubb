import Link from "next/link"
import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WindCompass } from "./wind-compass"
import type { Database } from "@/types/database"

type Spot = Database["public"]["Tables"]["spots"]["Row"]

const seasonLabels: Record<string, { text: string; className: string }> = {
  summer: { text: "Sommer", className: "bg-sky-100 text-sky-800 border-sky-200" },
  winter: { text: "Vinter", className: "bg-blue-100 text-blue-800 border-blue-200" },
}

const skillLabels: Record<string, { text: string; className: string }> = {
  beginner: { text: "Nybegynner", className: "bg-green-100 text-green-800 border-green-200" },
  experienced: { text: "Erfaren", className: "bg-amber-100 text-amber-800 border-amber-200" },
}

export function SpotCard({ spot }: { spot: Spot }) {
  const season = spot.season ? seasonLabels[spot.season] : null
  const skill = spot.skill_level ? skillLabels[spot.skill_level] : null

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group block rounded-lg border border-border bg-white p-4 transition-all hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-base font-semibold text-foreground group-hover:text-sky-600 transition-colors truncate">
            {spot.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{spot.area}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {season && (
              <Badge className={season.className}>{season.text}</Badge>
            )}
            {skill && (
              <Badge className={skill.className}>{skill.text}</Badge>
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
