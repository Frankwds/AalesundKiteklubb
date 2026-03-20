import "server-only"

import type { Json } from "@/types/database"
import { kiteZonesDocumentSchema } from "@/lib/validations/kite-zones"

const MAP_SIZE = "640x360"

const STROKE_HEX: Record<"red" | "yellow" | "green", string> = {
  green: "0x22c55e",
  yellow: "0xeab308",
  red: "0xef4444",
}

function parseKiteZonesJson(raw: Json | null | undefined) {
  if (raw == null) return null
  try {
    const v = typeof raw === "string" ? JSON.parse(raw) : raw
    const r = kiteZonesDocumentSchema.safeParse(v)
    return r.success ? r.data : null
  } catch {
    return null
  }
}

function ringToLatLngPath(ring: [number, number][]): string[] | null {
  if (ring.length < 2) return null
  const closed =
    ring[0]![0] === ring[ring.length - 1]![0] &&
    ring[0]![1] === ring[ring.length - 1]![1]
  const open = closed ? ring.slice(0, -1) : ring
  if (open.length < 3) return null
  const pts = open.map(([lng, lat]) => `${lat},${lng}`)
  return [...pts, pts[0]!]
}

/**
 * Google Static Maps URL for a spot (satellite). Returns null if no API key or nothing to show.
 */
export function getSpotStaticMapUrl(opts: {
  lat: number | null | undefined
  lng: number | null | undefined
  kiteZones: Json | null | undefined
}): string | null {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key || key === "GOOGLE_MAPS_API_KEY") return null

  const doc = parseKiteZonesJson(opts.kiteZones)
  const paths: string[] = []

  if (doc?.features?.length) {
    for (const f of doc.features) {
      const ring = f.geometry.coordinates[0] as [number, number][] | undefined
      if (!ring) continue
      const latLngs = ringToLatLngPath(ring)
      if (!latLngs) continue
      const hx = STROKE_HEX[f.properties.color]
      paths.push(
        `fillcolor:${hx}33|color:${hx}|weight:2|${latLngs.join("|")}`
      )
    }
  }

  const hasCoords = opts.lat != null && opts.lng != null
  const params = new URLSearchParams()
  params.set("size", MAP_SIZE)
  params.set("maptype", "satellite")
  params.set("key", key)

  if (paths.length > 0 && doc) {
    for (const p of paths) {
      params.append("path", p)
    }
    if (hasCoords) {
      params.append("markers", `color:blue|${opts.lat},${opts.lng}`)
    }
    const vis: string[] = []
    if (hasCoords) vis.push(`${opts.lat},${opts.lng}`)
    for (const f of doc.features) {
      const ring = f.geometry.coordinates[0] as [number, number][] | undefined
      if (!ring) continue
      const latLngs = ringToLatLngPath(ring)
      if (!latLngs) continue
      for (const pair of latLngs) {
        vis.push(pair)
      }
    }
    for (const v of vis.slice(0, 20)) {
      params.append("visible", v)
    }
    return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
  }

  if (hasCoords) {
    params.set("center", `${opts.lat},${opts.lng}`)
    params.set("zoom", "11")
    params.append("markers", `color:blue|${opts.lat},${opts.lng}`)
    return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
  }

  return null
}
