import { z } from "zod"

const KITE_ZONE_TAG_MAX = 100

const lngLatPair = z.tuple([z.number().finite(), z.number().finite()])

const kiteZoneFeaturePropertiesSchema = z.object({
  id: z.string().uuid(),
  color: z.enum(["red", "yellow", "green"]),
  tag: z.string().max(
    KITE_ZONE_TAG_MAX,
    `Tag kan ikke være lengre enn ${KITE_ZONE_TAG_MAX} tegn`
  ),
  order: z.number().int().optional(),
})

const kiteZoneFeatureSchema = z
  .object({
    type: z.literal("Feature"),
    properties: kiteZoneFeaturePropertiesSchema,
    geometry: z.object({
      type: z.literal("Polygon"),
      coordinates: z.array(z.array(lngLatPair)),
    }),
  })
  .superRefine((feat, ctx) => {
    const ring = feat.geometry.coordinates[0]
    if (!ring || ring.length === 0) {
      ctx.addIssue({
        code: "custom",
        message:
          "Hvert område må ha minst tre hjørner — tegnet polygon er ikke ferdig.",
        path: ["geometry", "coordinates", 0],
      })
      return
    }

    const closed =
      ring.length >= 2 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1]

    const openVertices = closed ? ring.slice(0, -1) : ring
    const uniqueKeys = new Set(
      openVertices.map((c) => `${c[0].toFixed(9)},${c[1].toFixed(9)}`)
    )

    if (uniqueKeys.size < 3) {
      ctx.addIssue({
        code: "custom",
        message:
          "Hvert område må ha minst tre hjørner — tegnet polygon er ikke ferdig.",
        path: ["geometry", "coordinates", 0],
      })
      return
    }

    if (!closed || ring.length < 4) {
      ctx.addIssue({
        code: "custom",
        message:
          "Polygonringen må være lukket (første og siste punkt må være like).",
        path: ["geometry", "coordinates", 0],
      })
      return
    }

    if (feat.properties.tag.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Tag kan ikke være tom for et område som er tegnet ferdig.",
        path: ["properties", "tag"],
      })
    }
  })

export const kiteZonesDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  type: z.literal("FeatureCollection"),
  features: z.array(kiteZoneFeatureSchema),
})

export type KiteZonesDocument = z.infer<typeof kiteZonesDocumentSchema>

export function parseKiteZonesField(raw: FormDataEntryValue | null): {
  success: true
  data: KiteZonesDocument | null
} | { success: false; error: string } {
  if (raw == null) return { success: true, data: null }
  const str = typeof raw === "string" ? raw.trim() : String(raw).trim()
  if (str === "" || str === "null") return { success: true, data: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(str)
  } catch {
    return {
      success: false,
      error: "Ugyldig JSON for skraverte områder. Sjekk at data er gyldig.",
    }
  }

  const result = kiteZonesDocumentSchema.safeParse(parsed)
  if (!result.success) {
    const first = result.error.issues[0]
    const msg = first?.message ?? "Ugyldige skraverte områder."
    return { success: false, error: msg }
  }

  return { success: true, data: result.data }
}
