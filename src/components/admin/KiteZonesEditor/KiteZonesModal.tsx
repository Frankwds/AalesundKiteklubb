"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  KITE_ZONE_COLORS,
  KITE_ZONE_MAP_FILL,
  type KiteZoneColor,
  type KiteZonesDocument,
  kiteZonesDocumentSchema,
  openRing,
  closeRing,
} from "@/lib/kite-zones/schema"
import { useKiteZonesMap } from "./useKiteZonesMap"

const DEFAULT_LAT = 62.4722
const DEFAULT_LNG = 6.1549

const MAP_STROKE: Record<KiteZoneColor, string> = {
  red: "#b00000",
  yellow: "#997700",
  green: "#1a6b1a",
}

type EditableZone = {
  id: string
  color: KiteZoneColor
  tag: string
  vertices: google.maps.LatLngLiteral[]
}

function editableFromJson(jsonStr: string): EditableZone[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr) as unknown
  } catch {
    return []
  }
  const r = kiteZonesDocumentSchema.safeParse(parsed)
  if (!r.success) return []
  return r.data.features.map((f) => ({
    id: f.id,
    color: f.properties.color,
    tag: f.properties.tag,
    vertices: openRing(f.geometry.coordinates[0] as [number, number][]).map(
      ([lng, lat]) => ({ lat, lng })
    ),
  }))
}

function toDocument(polygons: EditableZone[]): KiteZonesDocument {
  const complete = polygons.filter((p) => p.vertices.length >= 3)
  return {
    schemaVersion: 1,
    type: "FeatureCollection",
    features: complete.map((p, i) => ({
      type: "Feature",
      id: p.id,
      properties: {
        color: p.color,
        tag: p.tag.trim(),
        zIndex: i,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          closeRing(
            p.vertices.map((v) => [v.lng, v.lat] as [number, number])
          ),
        ],
      },
    })),
  }
}

type KiteZonesModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Current serialized document (form state). */
  formJson: string
  centerLat: number | null
  centerLng: number | null
  onCommit: (json: string) => void
}

export function KiteZonesModal({
  open,
  onOpenChange,
  formJson,
  centerLat,
  centerLng,
  onCommit,
}: KiteZonesModalProps) {
  const [polygons, setPolygons] = useState<EditableZone[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newColor, setNewColor] = useState<KiteZoneColor>("green")
  const [newTag, setNewTag] = useState("")

  const center = useMemo(() => {
    const lat =
      centerLat != null && !Number.isNaN(centerLat) ? centerLat : DEFAULT_LAT
    const lng =
      centerLng != null && !Number.isNaN(centerLng) ? centerLng : DEFAULT_LNG
    return { lat, lng }
  }, [centerLat, centerLng])

  useEffect(() => {
    if (!open) return
    const next = editableFromJson(formJson)
    setPolygons(next)
    setSelectedId(next.length > 0 ? next[0]!.id : null)
    setNewTag("")
    setNewColor("green")
  }, [open, formJson])

  const { mapRef, mapInstance, isLoading, error } = useKiteZonesMap(
    center.lat,
    center.lng,
    open
  )

  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId

  const createPolygon = useCallback(() => {
    const tag = newTag.trim()
    if (!tag) {
      toast.error("Skriv inn en tag før du oppretter området")
      return
    }
    const id = crypto.randomUUID()
    const zone: EditableZone = { id, color: newColor, tag, vertices: [] }
    setPolygons((prev) => [...prev, zone])
    setSelectedId(id)
    setNewTag("")
  }, [newColor, newTag])

  const deletePolygon = useCallback((id: string) => {
    setPolygons((prev) => prev.filter((p) => p.id !== id))
  }, [])

  useEffect(() => {
    setSelectedId((sel) => {
      if (polygons.length === 0) return null
      if (sel && polygons.some((p) => p.id === sel)) return sel
      return polygons[0]!.id
    })
  }, [polygons])

  useEffect(() => {
    if (!mapInstance || !open) return
    const g = window.google
    if (!g?.maps) return

    const disposables: google.maps.MapsEventListener[] = []
    const overlays: (google.maps.Polygon | google.maps.Polyline)[] = []
    const markers: google.maps.Marker[] = []

    polygons.forEach((p, stackIndex) => {
      const stroke = MAP_STROKE[p.color]
      const fill = KITE_ZONE_MAP_FILL[p.color]
      const selected = p.id === selectedId
      const fillOpacity = selected ? 0.45 : 0.22
      const strokeWeight = selected ? 3 : 2

      if (p.vertices.length >= 3) {
        const closed = [...p.vertices, p.vertices[0]!]
        const poly = new g.maps.Polygon({
          paths: closed,
          strokeColor: stroke,
          strokeOpacity: 0.95,
          strokeWeight,
          fillColor: fill,
          fillOpacity,
          clickable: false,
          zIndex: stackIndex,
          map: mapInstance,
        })
        overlays.push(poly)
      } else if (p.vertices.length === 2) {
        const line = new g.maps.Polyline({
          path: p.vertices,
          strokeColor: stroke,
          strokeOpacity: 0.85,
          strokeWeight,
          zIndex: stackIndex + 100,
          clickable: false,
          map: mapInstance,
        })
        overlays.push(line)
      } else if (p.vertices.length === 1) {
        const line = new g.maps.Polyline({
          path: p.vertices,
          strokeColor: stroke,
          strokeOpacity: 0.6,
          strokeWeight: 2,
          zIndex: stackIndex + 100,
          clickable: false,
          map: mapInstance,
        })
        overlays.push(line)
      }
    })

    const selectedPoly = polygons.find((p) => p.id === selectedId)
    if (selectedPoly) {
      selectedPoly.vertices.forEach((v, vertexIndex) => {
        const marker = new g.maps.Marker({
          position: v,
          map: mapInstance,
          draggable: true,
          zIndex: 1000 + vertexIndex,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeColor: "#333333",
            strokeWeight: 2,
          },
        })
        markers.push(marker)

        disposables.push(
          marker.addListener("dragend", () => {
            const pos = marker.getPosition()
            if (!pos) return
            setPolygons((prev) =>
              prev.map((poly) => {
                if (poly.id !== selectedIdRef.current) return poly
                const verts = [...poly.vertices]
                verts[vertexIndex] = {
                  lat: pos.lat(),
                  lng: pos.lng(),
                }
                return { ...poly, vertices: verts }
              })
            )
          }) as unknown as google.maps.MapsEventListener
        )

        disposables.push(
          marker.addListener("click", () => {
            setPolygons((prev) =>
              prev.map((poly) => {
                if (poly.id !== selectedIdRef.current) return poly
                return {
                  ...poly,
                  vertices: poly.vertices.filter((_, i) => i !== vertexIndex),
                }
              })
            )
          }) as unknown as google.maps.MapsEventListener
        )
      })
    }

    disposables.push(
      mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
        const id = selectedIdRef.current
        if (!id || !e.latLng) return
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        setPolygons((prev) =>
          prev.map((poly) => {
            if (poly.id !== id) return poly
            return {
              ...poly,
              vertices: [...poly.vertices, { lat, lng }],
            }
          })
        )
      }) as unknown as google.maps.MapsEventListener
    )

    return () => {
      overlays.forEach((o) => o.setMap(null))
      markers.forEach((m) => m.setMap(null))
      disposables.forEach((d) => g.maps.event.removeListener(d))
    }
  }, [mapInstance, open, polygons, selectedId])

  function handleSave() {
    const incomplete = polygons.filter(
      (p) => p.vertices.length > 0 && p.vertices.length < 3
    )
    if (incomplete.length > 0) {
      toast.error(
        `Minst 3 punkter kreves: ${incomplete.map((p) => `«${p.tag}»`).join(", ")}`
      )
      return
    }
    const doc = toDocument(polygons)
    onCommit(JSON.stringify(doc))
    onOpenChange(false)
  }

  function handleCancel() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[min(92vh,900px)] overflow-hidden flex flex-col p-4 gap-3"
        showCloseButton
      >
        <DialogHeader className="space-y-1 shrink-0">
          <DialogTitle>Skraver områder</DialogTitle>
          <DialogDescription>
            Velg farge og tag, opprett et område, velg det i listen, og trykk på
            kartet for å legge til hjørner. Dra hjørner for å flytte dem, trykk
            på et hjørne for å fjerne det.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <label className="sr-only" htmlFor="kite-zone-color">
            Farge
          </label>
          <select
            id="kite-zone-color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value as KiteZoneColor)}
            className="h-11 min-h-[44px] rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          >
            {KITE_ZONE_COLORS.map((c) => (
              <option key={c} value={c}>
                {c === "red" ? "Rød" : c === "yellow" ? "Gul" : "Grønn"}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Tag / beskrivelse"
            maxLength={120}
            className="flex-1 min-w-0 h-11 min-h-[44px] rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
          <Button
            type="button"
            variant="secondary"
            className="h-11 min-h-[44px] shrink-0"
            onClick={createPolygon}
          >
            Opprett
          </Button>
        </div>

        <details open className="rounded-lg border border-border bg-muted/20 shrink-0 group">
          <summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-medium list-none flex items-center justify-between min-h-[44px] [&::-webkit-details-marker]:hidden">
            <span>Områder ({polygons.length})</span>
            <span className="text-muted-foreground text-xs group-open:hidden">
              Trykk for å vise
            </span>
            <span className="text-muted-foreground text-xs hidden group-open:inline">
              Skjul
            </span>
          </summary>
          <ul className="px-2 pb-2 space-y-1 max-h-40 overflow-y-auto">
            {polygons.length === 0 ? (
              <li className="text-sm text-muted-foreground px-2 py-2">
                Ingen områder ennå — opprett over.
              </li>
            ) : (
              polygons.map((p) => {
                const selected = p.id === selectedId
                return (
                  <li
                    key={p.id}
                    className={`flex items-center gap-2 rounded-md px-2 py-2 min-h-[48px] ${
                      selected ? "bg-primary-muted/60" : "bg-background/80"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-sm shrink-0 border border-border"
                      style={{ backgroundColor: KITE_ZONE_MAP_FILL[p.color] }}
                      title={p.color}
                    />
                    <span className="flex-1 text-sm truncate">{p.tag}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {p.vertices.length} pkt
                    </span>
                    <Button
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      className="min-h-[40px] min-w-[4rem]"
                      onClick={() => setSelectedId(p.id)}
                    >
                      {selected ? "Valgt" : "Velg"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="min-h-11 min-w-11 text-destructive hover:text-destructive shrink-0"
                      title="Slett område"
                      onClick={() => deletePolygon(p.id)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </li>
                )
              })
            )}
          </ul>
        </details>

        <div className="relative flex-1 min-h-[280px] rounded-lg overflow-hidden border border-border bg-muted/30">
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
          {open && <div ref={mapRef} className="w-full h-full min-h-[280px]" />}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 flex-1 sm:flex-none"
            onClick={handleCancel}
          >
            Avbryt
          </Button>
          <Button
            type="button"
            className="min-h-11 flex-1 sm:flex-none bg-primary hover:bg-primary/90"
            onClick={handleSave}
          >
            Lagre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
