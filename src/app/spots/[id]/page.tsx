import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Cloud, ExternalLink, MapPin, Navigation } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WindCompass } from "@/components/spots/wind-compass"
import {
  seasonLabels,
  skillLabels,
  waterTypeLabels,
} from "@/lib/spot-labels"
import { getSpot } from "@/lib/queries/spots"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const spot = await getSpot(id)
  if (!spot) return { title: "Spot ikke funnet" }
  return {
    title: `${spot.name} — Ålesund Kiteklubb`,
    description: spot.description ?? `Kitespot: ${spot.name}, ${spot.area}`,
  }
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const spot = await getSpot(id)
  if (!spot) notFound()

  const season = spot.season ? seasonLabels[spot.season] : null
  const skill = spot.skill_level ? skillLabels[spot.skill_level] : null
  const hasCoords = spot.latitude != null && spot.longitude != null

  return (
    <div className="px-6 py-8">
      {/* Back link */}
      <Link
        href="/spots"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Tilbake til spotter
      </Link>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
        {spot.name}
      </h1>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-8">
        {season && (
          <Badge variant={season.variant}>{season.text}</Badge>
        )}
        {skill && (
          <Badge variant={skill.variant}>{skill.text}</Badge>
        )}
        <Badge variant="neutral">{spot.area}</Badge>
      </div>

      {/* Wind Compass */}
      {spot.wind_directions && spot.wind_directions.length > 0 ? (
        <Section title="Vindretninger">
          <WindCompass directions={spot.wind_directions} size="lg" />
        </Section>
      ) : (
        <Section title="Vindretninger">
          <p className="text-sm text-muted-foreground">
            Ingen vindretninger spesifisert
          </p>
        </Section>
      )}

      {/* Om spotten */}
      {spot.description && (
        <Section title="Om spotten">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
            {spot.description}
          </p>
        </Section>
      )}

      {/* Kart */}
      {spot.map_image_url && (
        <Section title="Kart">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <Image
              src={spot.map_image_url}
              alt={`Kart over ${spot.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </Section>
      )}

      {/* Værmelding */}
      {hasCoords && (
        <Section title="Værmelding">
          <a
            href={`https://www.yr.no/nb/v%C3%A6rvarsel/daglig-tabell/${spot.latitude},${spot.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary-muted transition-all"
          >
            <Cloud className="h-4 w-4 text-primary" />
            Se værmelding på Yr.no
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        </Section>
      )}

      {/* Veibeskrivelse */}
      {hasCoords && (
        <Section title="Veibeskrivelse">
          <a
            href={`https://www.google.com/maps?q=${spot.latitude},${spot.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary-muted transition-all"
          >
            <Navigation className="h-4 w-4 text-primary" />
            Vis i Google Maps
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        </Section>
      )}

      {/* Nødvendige kiteskills */}
      {(spot.skill_level || spot.skill_notes) && (
        <Section title="Nødvendige kiteskills">
          <div className="space-y-2">
            {skill && (
              <Badge variant={skill.variant}>{skill.text}</Badge>
            )}
            {spot.skill_notes && (
              <p className="text-sm leading-relaxed text-foreground/80">
                {spot.skill_notes}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Type (water type) */}
      {spot.water_type && spot.water_type.length > 0 && (
        <Section title="Type">
          <div className="flex flex-wrap gap-2">
            {spot.water_type.map((type) => (
              <Badge key={type} variant="neutral">
                {waterTypeLabels[type] ?? type}
              </Badge>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <Separator className="mb-6" />
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  )
}
