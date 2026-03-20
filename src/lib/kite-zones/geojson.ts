import type { KiteZonesDocument } from "@/lib/validations/kite-zones"

export type KiteZoneColor = "red" | "yellow" | "green"

export type EditorPolygon = {
  id: string
  color: KiteZoneColor
  tag: string
  vertices: { lat: number; lng: number }[]
}

export function featureCollectionToEditor(
  doc: KiteZonesDocument | null | undefined
): EditorPolygon[] {
  if (!doc?.features?.length) return []
  const sorted = [...doc.features].sort(
    (a, b) =>
      (a.properties.order ?? 0) - (b.properties.order ?? 0)
  )
  return sorted.map((f) => {
    const ring = f.geometry.coordinates[0] ?? []
    const closed =
      ring.length >= 2 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1]
    const open = closed ? ring.slice(0, -1) : ring
    return {
      id: f.properties.id,
      color: f.properties.color,
      tag: f.properties.tag,
      vertices: open.map(([lng, lat]) => ({ lat, lng })),
    }
  })
}

/** GeoJSON ring: lng/lat; closes ring when there are at least 3 vertices. */
export function editorToFeatureCollection(
  polygons: EditorPolygon[]
): KiteZonesDocument {
  return {
    schemaVersion: 1,
    type: "FeatureCollection",
    features: polygons.map((p, order) => ({
      type: "Feature" as const,
      properties: {
        id: p.id,
        color: p.color,
        tag: p.tag,
        order,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [ringFromVertices(p.vertices)],
      },
    })),
  }
}

function ringFromVertices(vertices: { lat: number; lng: number }[]): [number, number][] {
  if (vertices.length === 0) return []
  const lngLat = vertices.map((v) => [v.lng, v.lat] as [number, number])
  if (vertices.length >= 3) {
    const first = lngLat[0]!
    const last = lngLat[lngLat.length - 1]!
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return [...lngLat, [...first]]
    }
  }
  return lngLat
}
