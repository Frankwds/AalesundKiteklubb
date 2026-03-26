import { Suspense } from "react"
import { MapPin } from "lucide-react"
import { getSpots } from "@/lib/queries/spots"
import { SpotList } from "@/components/spots/spot-list"
import { SkeletonCard } from "@/components/ui/skeletons"

export const metadata = {
  title: "Spot guide",
  description: "Finn de beste kitespottene på Sunnmøre",
  alternates: { canonical: "/spots" },
}

export default async function SpotsPage() {
  const spots = await getSpots()

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Spot guide
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Utforsk de beste stedene for kitesurfing på Sunnmøre. Filtrer etter
          sesong, område eller vindretning.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        }
      >
        <SpotList spots={spots} />
      </Suspense>
    </div>
  )
}
