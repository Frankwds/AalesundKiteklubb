import { Suspense } from "react"
import Link from "next/link"
import { MapPin, Plus } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getSpots } from "@/lib/queries/spots"
import { SpotList } from "@/components/spots/spot-list"
import { SkeletonCard } from "@/components/ui/skeletons"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

const NEW_SPOT_PATH = "/spots/ny"

export const metadata = {
  title: "Spot guide",
  description: "Finn de beste kitespottene på Sunnmøre",
  alternates: { canonical: "/spots" },
}

export default async function SpotsPage() {
  const [spots, user] = await Promise.all([getSpots(), getCurrentUser()])
  const addSpotHref = user
    ? NEW_SPOT_PATH
    : `/login?next=${encodeURIComponent(NEW_SPOT_PATH)}`

  return (
    <div className="px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-6 w-6 text-primary shrink-0" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Spot guide
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Utforsk de beste stedene for kitesurfing på Sunnmøre. Filtrer etter
            sesong, område eller vindretning.
          </p>
        </div>
        <Link
          href={addSpotHref}
          className={cn(
            buttonVariants({ variant: "primaryLift", size: "lg" }),
            "shrink-0 self-stretch sm:self-start inline-flex items-center justify-center"
          )}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Legg til ny spot
        </Link>
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
