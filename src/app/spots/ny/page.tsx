import { redirect } from "next/navigation"
import { MapPin } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getSpots } from "@/lib/queries/spots"
import { AddSpotPageClient } from "@/components/spots/add-spot-page-client"

export const metadata = {
  title: "Legg til spot",
  description: "Opprett en ny kitespot i spotguiden",
}

export default async function NewSpotPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/spots/ny")}`)
  }

  const spots = await getSpots()

  return (
    <div className="px-6 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-6 w-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Legg til ny spot
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Fyll ut skjemaet under. Alle innloggede medlemmer kan bidra.
      </p>
      <AddSpotPageClient spots={spots} />
    </div>
  )
}
