"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMapInstance } from "@/components/admin/MapCoordinatesPicker/hooks/useMapInstance"
import {
  editorToFeatureCollection,
  featureCollectionToEditor,
  type EditorPolygon,
  type KiteZoneColor,
} from "@/lib/kite-zones/geojson"
import type { KiteZonesDocument } from "@/lib/validations/kite-zones"

const DEFAULT_LAT = 62.4722
const DEFAULT_LNG = 6.1549

const COLORS: { value: KiteZoneColor; label: string }[] = [
  { value: "green", label: "Grønn" },
  { value: "yellow", label: "Gul" },
  { value: "red", label: "Rød" },
]

const STROKE: Record<KiteZoneColor, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
}

function parseCommittedJson(json: string): EditorPolygon[] {
  const t = json.trim()
  if (!t) return []
  try {
    const doc = JSON.parse(t) as KiteZonesDocument
    if (doc?.type !== "FeatureCollection" || !Array.isArray(doc.features)) return []
    return featureCollectionToEditor(doc)
  } catch {
    return []
  }
}

function allVertexLatLng(polygons: EditorPolygon[]): google.maps.LatLngLiteral[] {
  const out: google.maps.LatLngLiteral[] = []
  for (const p of polygons) {
    for (const v of p.vertices) {
      out.push({ lat: v.lat, lng: v.lng })
    }
  }
  return out
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Last committed JSON from parent (GeoJSON FeatureCollection string). */
  committedJson: string
  spotLat: number | null | undefined
  spotLng: number | null | undefined
  onCommit: (doc: KiteZonesDocument) => void
}

export function KiteZonesMapModal({
  open,
  onOpenChange,
  committedJson,
  spotLat,
  spotLng,
  onCommit,
}: Props) {
  const [polygons, setPolygons] = useState<EditorPolygon[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newColor, setNewColor] = useState<KiteZoneColor>("green")
  const [newTag, setNewTag] = useState("")
  const fitDoneRef = useRef(false)
  const prevOpenRef = useRef(false)
  const dragVertexRef = useRef(false)

  const centerLat =
    spotLat != null && !Number.isNaN(spotLat) ? spotLat : DEFAULT_LAT
  const centerLng =
    spotLng != null && !Number.isNaN(spotLng) ? spotLng : DEFAULT_LNG

  const { mapRef, mapInstance, isLoading, error } = useMapInstance({
    latitude: centerLat,
    longitude: centerLng,
    enabled: open,
  })

  useEffect(() => {
    if (!open) {
      fitDoneRef.current = false
      prevOpenRef.current = false
      return
    }
    if (!prevOpenRef.current) {
      const next = parseCommittedJson(committedJson)
      setPolygons(next)
      setSelectedId(next.length > 0 ? next[next.length - 1]!.id : null)
      setNewTag("")
      setNewColor("green")
    }
    prevOpenRef.current = open
  }, [open, committedJson])

  useEffect(() => {
    if (selectedId && !polygons.some((p) => p.id === selectedId)) {
      setSelectedId(
        polygons.length > 0 ? polygons[polygons.length - 1]!.id : null
      )
    }
  }, [polygons, selectedId])

  useEffect(() => {
    if (!mapInstance || !open || fitDoneRef.current) return
    const parsed = parseCommittedJson(committedJson)
    const pts = allVertexLatLng(parsed)
    const g = window.google?.maps
    if (!g) return

    if (pts.length > 0) {
      const b = new g.LatLngBounds()
      pts.forEach((p) => b.extend(p))
      if (spotLat != null && spotLng != null) {
        b.extend({ lat: spotLat, lng: spotLng })
      }
      mapInstance.fitBounds(b, 48)
    } else if (spotLat != null && spotLng != null) {
      mapInstance.setCenter({ lat: spotLat, lng: spotLng })
      mapInstance.setZoom(12)
    } else {
      mapInstance.setCenter({ lat: DEFAULT_LAT, lng: DEFAULT_LNG })
      mapInstance.setZoom(12)
    }
    fitDoneRef.current = true
  }, [mapInstance, open, committedJson, spotLat, spotLng])

  const updateVertex = useCallback(
    (polygonId: string, index: number, lat: number, lng: number) => {
      setPolygons((prev) =>
        prev.map((p) => {
          if (p.id !== polygonId) return p
          const vertices = [...p.vertices]
          vertices[index] = { lat, lng }
          return { ...p, vertices }
        })
      )
    },
    []
  )

  const removeVertex = useCallback((polygonId: string, index: number) => {
    setPolygons((prev) =>
      prev.map((p) =>
        p.id === polygonId
          ? { ...p, vertices: p.vertices.filter((_, i) => i !== index) }
          : p
      )
    )
  }, [])

  const addVertex = useCallback((polygonId: string, lat: number, lng: number) => {
    setPolygons((prev) =>
      prev.map((p) =>
        p.id === polygonId
          ? { ...p, vertices: [...p.vertices, { lat, lng }] }
          : p
      )
    )
  }, [])

  const overlaysRef = useRef<{
    polygons: (google.maps.Polygon | google.maps.Polyline)[]
    markers: google.maps.Marker[]
    listeners: google.maps.MapsEventListener[]
  }>({ polygons: [], markers: [], listeners: [] })

  useEffect(() => {
    if (!mapInstance || !open) return
    const g = window.google?.maps
    if (!g) return

    const { polygons: polys, markers, listeners } = overlaysRef.current
    listeners.forEach((l) => l.remove())
    markers.forEach((m) => m.setMap(null))
    polys.forEach((pl) => pl.setMap(null))
    overlaysRef.current = { polygons: [], markers: [], listeners: [] }

    polygons.forEach((poly, creationIndex) => {
      const selected = poly.id === selectedId
      const path = poly.vertices.map((v) => ({ lat: v.lat, lng: v.lng }))
      const strokeColor = STROKE[poly.color]
      const strokeWeight = selected ? 3 : 2
      const zBase = 10 + creationIndex

      if (path.length >= 3) {
        const polygon = new g.Polygon({
          paths: path,
          strokeColor,
          strokeOpacity: 0.95,
          strokeWeight,
          fillColor: strokeColor,
          fillOpacity: selected ? 0.45 : 0.22,
          clickable: false,
          zIndex: zBase,
          map: mapInstance,
        })
        overlaysRef.current.polygons.push(polygon)
      } else if (path.length === 2) {
        const line = new g.Polyline({
          path,
          strokeColor,
          strokeOpacity: 0.95,
          strokeWeight,
          clickable: false,
          zIndex: zBase,
          map: mapInstance,
        })
        overlaysRef.current.polygons.push(line as unknown as google.maps.Polygon)
      }

      poly.vertices.forEach((v, vi) => {
        const marker = new g.Marker({
          position: { lat: v.lat, lng: v.lng },
          map: mapInstance,
          draggable: true,
          zIndex: 1000 + creationIndex * 50 + vi,
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: selected ? 9 : 7,
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeColor: STROKE[poly.color],
            strokeWeight: 2,
          },
        })

        let wasDragged = false
        marker.addListener("dragstart", () => {
          wasDragged = false
          dragVertexRef.current = true
        })
        marker.addListener("drag", () => {
          wasDragged = true
        })
        marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
          dragVertexRef.current = false
          const pos = e.latLng
          if (pos) {
            updateVertex(poly.id, vi, pos.lat(), pos.lng())
          }
        })
        marker.addListener("click", () => {
          if (!wasDragged) {
            removeVertex(poly.id, vi)
          }
        })

        overlaysRef.current.markers.push(marker)
      })
    })

    // Register here (not a separate effect): the block above clears `listeners` on every
    // `polygons` change; a detached effect with `[selectedId, addVertex]` deps never re-ran,
    // so the map lost its click listener after the first vertex.
    const mapClickListener = mapInstance.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        if (dragVertexRef.current) return
        if (!selectedId || !e.latLng) return
        addVertex(selectedId, e.latLng.lat(), e.latLng.lng())
      }
    )
    overlaysRef.current.listeners.push(mapClickListener)

    return () => {
      overlaysRef.current.listeners.forEach((l) => l.remove())
      overlaysRef.current.markers.forEach((m) => m.setMap(null))
      overlaysRef.current.polygons.forEach((p) => p.setMap(null))
      overlaysRef.current = { polygons: [], markers: [], listeners: [] }
    }
  }, [mapInstance, open, polygons, selectedId, updateVertex, removeVertex, addVertex])

  function handleCreatePolygon() {
    const id = crypto.randomUUID()
    setPolygons((prev) => [
      ...prev,
      { id, color: newColor, tag: newTag.trim() || "Område", vertices: [] },
    ])
    setSelectedId(id)
  }

  function handleDeletePolygon(id: string) {
    setPolygons((prev) => prev.filter((p) => p.id !== id))
  }

  function handleSaveModal() {
    onCommit(editorToFeatureCollection(polygons))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Skraver områder</DialogTitle>
          <DialogDescription>
            Tegn områder på kartet for klubbens veiledning. Trykk på kartet for å
            legge til hjørner i valgt område. Trykk på et hjørne for å fjerne det.
            Dra fra hjørne for å flytte — ellers panorerer du kartet. Endringer
            lagres når du trykker Lagre nedenfor og deretter lagrer spot-skjemaet.
          </DialogDescription>
        </DialogHeader>

        <details open className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium outline-none">
            Områder og liste
          </summary>
          <div className="mt-3 space-y-3 pb-1">
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Farge
                </label>
                <select
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value as KiteZoneColor)}
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {COLORS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-muted-foreground mb-1">
                  Tag
                </label>
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Kort merkelapp"
                  maxLength={100}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <Button type="button" variant="primaryLift" size="sm" onClick={handleCreatePolygon}>
                Nytt område
              </Button>
            </div>

            <ul className="space-y-2 max-h-36 overflow-y-auto">
              {polygons.length === 0 ? (
                <li className="text-muted-foreground text-xs">Ingen områder ennå.</li>
              ) : (
                polygons.map((p) => (
                  <li
                    key={p.id}
                    className={`flex flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 ${
                      p.id === selectedId ? "border-primary bg-primary-muted/30" : "border-border"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left text-sm font-medium truncate"
                      onClick={() => setSelectedId(p.id)}
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                        style={{ backgroundColor: STROKE[p.color] }}
                      />
                      {p.tag || "Uten navn"}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({p.vertices.length} hjørner)
                      </span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive shrink-0"
                      onClick={() => handleDeletePolygon(p.id)}
                    >
                      Slett
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </details>

        <div className="relative flex-1 min-h-[min(50vh,420px)] rounded-lg overflow-hidden border border-border bg-muted/30">
          {open && (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                  <span className="text-sm text-muted-foreground">Laster kart...</span>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-10 p-4">
                  <span className="text-sm text-destructive text-center">{error}</span>
                </div>
              )}
              <div ref={mapRef} className="w-full h-full min-h-[min(50vh,420px)]" />
            </>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <DialogClose render={<Button variant="outline" />}>Avbryt</DialogClose>
          <Button variant="primaryLift" onClick={handleSaveModal}>
            Lagre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
