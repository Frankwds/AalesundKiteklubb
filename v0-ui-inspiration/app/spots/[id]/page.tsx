import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WindCompass } from "@/components/wind-compass"
import { cn } from "@/lib/utils"
import { notFound } from "next/navigation"

// Mock spot data
const spotsData: Record<string, {
  id: string
  name: string
  area: string
  season: "sommer" | "vinter"
  skillLevel: "nybegynner" | "erfaren"
  windDirections: string[]
  description: string
  skillNote: string
  waterTypes: string[]
  yrUrl: string
  googleMapsUrl: string
}> = {
  "giske-nordvest": {
    id: "giske-nordvest",
    name: "Giske Nordvest",
    area: "Giske",
    season: "sommer",
    skillLevel: "nybegynner",
    windDirections: ["SV", "V", "NV"],
    description: "En av de mest populære spotene på Sunnmøre for kitesurfing. Fin sandstrand med god plass og parkeringsmuligheter. Fungerer best med vestlige vinder og byr på både flatt vann og mindre bølger avhengig av forhold. Ideell for nybegynnere på grunn av grunn bunn og rolige forhold.",
    skillNote: "Passer godt for nybegynnere med grunn bunn og rolige forhold.",
    waterTypes: ["Flatt vann", "Chop"],
    yrUrl: "https://www.yr.no/nb/v%C3%A6rvarsel/daglig/1-269980/Norge/M%C3%B8re%20og%20Romsdal/Giske/Giske",
    googleMapsUrl: "https://www.google.com/maps/place/Giske",
  },
  "alnes": {
    id: "alnes",
    name: "Alnes",
    area: "Giske",
    season: "sommer",
    skillLevel: "erfaren",
    windDirections: ["N", "NV", "V"],
    description: "Spektakulær spot med utsikt mot Alnes fyr. Kjent for større bølger og sterkere strømmer som krever erfaring. Steinstrand med begrenset plass. Anbefales kun for erfarne kitere som er komfortable med bølger.",
    skillNote: "Krever erfaring med bølger og sterk strøm.",
    waterTypes: ["Bølger", "Chop"],
    yrUrl: "https://www.yr.no/nb/v%C3%A6rvarsel/daglig/1-269980/Norge/M%C3%B8re%20og%20Romsdal/Giske/Alnes",
    googleMapsUrl: "https://www.google.com/maps/place/Alnes+Fyr",
  },
  "mauseidvag": {
    id: "mauseidvag",
    name: "Mauseidvåg",
    area: "Ålesund",
    season: "vinter",
    skillLevel: "nybegynner",
    windDirections: ["S", "SØ", "Ø"],
    description: "Beskyttet vik som fungerer godt om vinteren med østlige vinder. Flatt vann og rolige forhold gjør dette til en ideell plass for nybegynnere og øving av triks.",
    skillNote: "Passer godt for nybegynnere og trikstrening.",
    waterTypes: ["Flatt vann"],
    yrUrl: "https://www.yr.no/nb/v%C3%A6rvarsel/daglig/1-211102/Norge/M%C3%B8re%20og%20Romsdal/%C3%85lesund/%C3%85lesund",
    googleMapsUrl: "https://www.google.com/maps/place/Mauseidv%C3%A5g",
  },
  "vigra-nord": {
    id: "vigra-nord",
    name: "Vigra Nord",
    area: "Vigra",
    season: "sommer",
    skillLevel: "erfaren",
    windDirections: ["N", "NØ"],
    description: "Eksponert spot på nordsiden av Vigra. Kan bli store bølger med nordlig vind. Krever erfaring og god kjennskap til lokale forhold.",
    skillNote: "Krever erfaring med store bølger og varierende forhold.",
    waterTypes: ["Bølger", "Chop"],
    yrUrl: "https://www.yr.no/nb/v%C3%A6rvarsel/daglig/1-269980/Norge/M%C3%B8re%20og%20Romsdal/Giske/Vigra",
    googleMapsUrl: "https://www.google.com/maps/place/Vigra",
  },
  "hareid-strand": {
    id: "hareid-strand",
    name: "Hareid Strand",
    area: "Hareid",
    season: "vinter",
    skillLevel: "nybegynner",
    windDirections: ["S", "SV", "V"],
    description: "Fin strand ved Hareid sentrum. Godt egnet for vinterkiting med sørlige vinder. Rolige forhold og god tilgang fra parkering.",
    skillNote: "Passer godt for nybegynnere med rolige forhold.",
    waterTypes: ["Flatt vann", "Chop"],
    yrUrl: "https://www.yr.no/nb/v%C3%A6rvarsel/daglig/1-245024/Norge/M%C3%B8re%20og%20Romsdal/Hareid/Hareid",
    googleMapsUrl: "https://www.google.com/maps/place/Hareid",
  },
  "giske-sor": {
    id: "giske-sor",
    name: "Giske Sør",
    area: "Giske",
    season: "sommer",
    skillLevel: "erfaren",
    windDirections: ["S", "SØ"],
    description: "Sørvendt spot på Giske med mulighet for bølger når det blåser fra sør. Krever erfaring på grunn av strøm og begrenset plass.",
    skillNote: "Krever erfaring med strøm og bølger.",
    waterTypes: ["Bølger", "Chop"],
    yrUrl: "https://www.yr.no/nb/v%C3%A6rvarsel/daglig/1-269980/Norge/M%C3%B8re%20og%20Romsdal/Giske/Giske",
    googleMapsUrl: "https://www.google.com/maps/place/Giske",
  },
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const spot = spotsData[id]

  if (!spot) {
    notFound()
  }

  return (
    <div className="p-6 md:p-8">
      {/* Back link */}
      <Link
        href="/spots"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-sky-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Tilbake til spot guide
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{spot.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {spot.area}
          </Badge>
          <Badge
            className={cn(
              "text-sm",
              spot.season === "sommer"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-sky-100 text-sky-800 hover:bg-sky-100"
            )}
          >
            {spot.season === "sommer" ? "Sommer" : "Vinter"}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Wind Compass */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vindkompass</CardTitle>
            </CardHeader>
            <CardContent>
              <WindCompass activeDirections={spot.windDirections} />
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Om spotten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">{spot.description}</p>
            </CardContent>
          </Card>

          {/* Skill Level */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nødvendige kiteskills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  className={cn(
                    "text-sm",
                    spot.skillLevel === "nybegynner"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                  )}
                >
                  {spot.skillLevel === "nybegynner" ? "Nybegynner" : "Erfaren"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{spot.skillNote}</p>
            </CardContent>
          </Card>

          {/* Water Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vanntype</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {spot.waterTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-sm">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Map placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] rounded-lg bg-muted relative overflow-hidden">
                <Image
                  src="/images/kite-beach-bg.jpg"
                  alt={`Kart over ${spot.name}`}
                  fill
                  className="object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground bg-white/80 px-4 py-2 rounded-lg">
                    Satellittbilde av området
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Button asChild className="bg-sky-600 hover:bg-sky-700 h-12">
              <a href={spot.yrUrl} target="_blank" rel="noopener noreferrer">
                Se vær på Yr.no
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <a href={spot.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                Vis i Google Maps
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
