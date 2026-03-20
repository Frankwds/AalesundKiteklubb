import { z } from "zod"
import type { Json } from "@/types/database"

export const KITE_ZONE_COLORS = ["red", "yellow", "green"] as const
export type KiteZoneColor = (typeof KITE_ZONE_COLORS)[number]

/** UI / map fill swatches (not Static API hex). */
export const KITE_ZONE_MAP_FILL: Record<KiteZoneColor, string> = {
  red: "#ff3333",
  yellow: "#ffdd44",
  green: "#33cc55",
}

export const KITE_ZONES_SCHEMA_VERSION = 1 as const
export const MAX_KITE_ZONE_POLYGONS = 20
export const MAX_KITE_ZONE_TAG_LENGTH = 120

const positionSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
])

function ringHasClosure(ring: [number, number][]) {
  if (ring.length < 4) return false
  const a = ring[0]
  const b = ring[ring.length - 1]
  return a[0] === b[0] && a[1] === b[1]
}

function uniqueVertexCount(ring: [number, number][]) {
  if (ring.length < 2) return ring.length
  const last = ring[ring.length - 1]
  const first = ring[0]
  const closed =
    ring.length >= 4 && last[0] === first[0] && last[1] === first[1]
  return closed ? ring.length - 1 : ring.length
}

const polygonFeatureSchema = z
  .object({
    type: z.literal("Feature"),
    id: z.string().uuid(),
    properties: z.object({
      color: z.enum(KITE_ZONE_COLORS),
      tag: z
        .string()
        .min(1, "Tag kan ikke være tom")
        .max(MAX_KITE_ZONE_TAG_LENGTH),
      zIndex: z.number().int().optional(),
    }),
    geometry: z.object({
      type: z.literal("Polygon"),
      coordinates: z.array(z.array(positionSchema).min(4)),
    }),
  })
  .superRefine((f, ctx) => {
    const ring = f.geometry.coordinates[0] as [number, number][]
    if (!ringHasClosure(ring)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Polygon må være lukket (første og siste punkt like)",
        path: ["geometry", "coordinates", 0],
      })
    }
    if (uniqueVertexCount(ring) < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `«${f.properties.tag}»: minst 3 hjørner kreves`,
        path: ["geometry", "coordinates", 0],
      })
    }
  })

export const kiteZonesDocumentSchema = z.object({
  schemaVersion: z.literal(KITE_ZONES_SCHEMA_VERSION),
  type: z.literal("FeatureCollection"),
  features: z.array(polygonFeatureSchema).max(MAX_KITE_ZONE_POLYGONS),
})

export type KiteZonesDocument = z.infer<typeof kiteZonesDocumentSchema>

/** Open ring for editing: drop duplicate closing point. */
export function openRing(ring: [number, number][]): [number, number][] {
  if (ring.length < 2) return [...ring]
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring.slice(0, -1)
  }
  return [...ring]
}

/** Close ring for GeoJSON (first point repeated at end). */
export function closeRing(ring: [number, number][]): [number, number][] {
  if (ring.length === 0) return ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) {
    return [...ring]
  }
  return [...ring, [first[0], first[1]] as [number, number]]
}

export function emptyKiteZonesDocument(): KiteZonesDocument {
  return {
    schemaVersion: KITE_ZONES_SCHEMA_VERSION,
    type: "FeatureCollection",
    features: [],
  }
}

/** Stable JSON string for hidden form field (valid empty doc or parsed DB value). */
export function serializeKiteZonesForForm(kite_zones: Json | null | undefined): string {
  const parsed = kiteZonesDocumentSchema.safeParse(kite_zones)
  return JSON.stringify(parsed.success ? parsed.data : emptyKiteZonesDocument())
}
