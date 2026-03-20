import type { Json } from "@/types/database"
import {
  kiteZonesDocumentSchema,
  type KiteZoneColor,
} from "@/lib/kite-zones/schema"

const STATIC_MAP_BASE = "https://maps.googleapis.com/maps/api/staticmap"

/** Fill (with alpha) + stroke for Static Maps `path` color. */
const ZONE_STYLE: Record<
  KiteZoneColor,
  { fill: string; stroke: string; weight: number }
> = {
  red: { fill: "0xFF000055", stroke: "0xCC0000CC", weight: 2 },
  yellow: { fill: "0xFFFF0055", stroke: "0xCCAA00CC", weight: 2 },
  green: { fill: "0x00FF0055", stroke: "0x00AA00CC", weight: 2 },
}

function appendVisible(
  params: URLSearchParams,
  lat: number,
  lng: number
): void {
  params.append("visible", `${lat},${lng}`)
}

function ringToPathPoints(ring: [number, number][]): string {
  return ring.map(([lng, lat]) => `${lat},${lng}`).join("|")
}

export type StaticSpotMapOptions = {
  latitude: number | null
  longitude: number | null
  kiteZones: Json | null
  width?: number
  height?: number
}

/**
 * Builds a Google Maps Static API URL. Returns null if no API key or nothing to show.
 */
export function buildStaticSpotMapUrl({
  latitude,
  longitude,
  kiteZones,
  width = 640,
  height = 360,
}: StaticSpotMapOptions): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey || apiKey === "GOOGLE_MAPS_API_KEY") {
    return null
  }

  const lat =
    latitude != null && !Number.isNaN(Number(latitude))
      ? Number(latitude)
      : null
  const lng =
    longitude != null && !Number.isNaN(Number(longitude))
      ? Number(longitude)
      : null

  const parsed = kiteZonesDocumentSchema.safeParse(kiteZones)
  const features = parsed.success ? parsed.data.features : []

  const hasCoords = lat != null && lng != null
  const hasZones = features.length > 0

  if (!hasCoords && !hasZones) {
    return null
  }

  const params = new URLSearchParams()
  params.set("size", `${width}x${height}`)
  params.set("scale", "2")
  params.set("maptype", "satellite")
  params.set("key", apiKey)

  if (hasCoords) {
    params.append("markers", `size:mid|color:0x1a73e8|${lat},${lng}`)
  }

  if (hasZones) {
    for (const f of features) {
      const ring = f.geometry.coordinates[0] as [number, number][]
      const style = ZONE_STYLE[f.properties.color]
      const pts = ringToPathPoints(ring)
      params.append(
        "path",
        `fillcolor:${style.fill}|color:${style.stroke}|weight:${style.weight}|${pts}`
      )
      for (const [x, y] of ring) {
        appendVisible(params, y, x)
      }
    }
    if (hasCoords) {
      appendVisible(params, lat, lng)
    }
  } else if (hasCoords) {
    params.set("center", `${lat},${lng}`)
    params.set("zoom", "11")
  }

  return `${STATIC_MAP_BASE}?${params.toString()}`
}
