"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Loader2, MapPin } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Json } from "@/types/database"
import { serializeKiteZonesForForm } from "@/lib/kite-zones/schema"
import { MapCoordinatesModal } from "@/components/admin/MapCoordinatesPicker/MapCoordinatesModal"
import { KiteZonesModal } from "@/components/admin/KiteZonesEditor"
import { AdminWindCompass } from "@/components/admin/AdminWindCompass"
import { cn } from "@/lib/utils"

export type SpotFormSpot = {
  id: string
  name: string
  description: string | null
  area: string
  season: string | null
  skill_level: string | null
  skill_notes: string | null
  latitude: number | null
  longitude: number | null
  wind_directions: string[] | null
  water_type: string[] | null
  map_image_url: string | null
  kite_zones: Json | null
  created_at: string
}

export const SPOT_FORM_SEASONS = [
  { value: "summer", label: "Sommer" },
  { value: "winter", label: "Vinter" },
] as const

export const SPOT_FORM_SKILL_LEVELS = [
  { value: "beginner", label: "Nybegynner" },
  { value: "experienced", label: "Erfaren" },
] as const

const WATER_TYPES = ["flat", "chop", "waves"] as const

type SpotFormLayout = "dialog" | "page"

export function SpotForm({
  spot,
  spots,
  isPending,
  onSubmit,
  layout = "dialog",
  cancelHref = "/spots",
}: {
  spot?: SpotFormSpot
  spots: SpotFormSpot[]
  isPending: boolean
  onSubmit: (formData: FormData) => void
  layout?: SpotFormLayout
  /** Used when layout is "page" for the Avbryt action */
  cancelHref?: string
}) {
  const areas = [...new Set(spots.map((s) => s.area).filter(Boolean))].sort()
  const formRef = useRef<HTMLFormElement>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lngRef = useRef<HTMLInputElement>(null)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [kiteZonesModalOpen, setKiteZonesModalOpen] = useState(false)
  const [kiteZonesJson, setKiteZonesJson] = useState(() =>
    serializeKiteZonesForForm(spot?.kite_zones)
  )
  const [selectedWindDirs, setSelectedWindDirs] = useState<string[]>(
    spot?.wind_directions ?? []
  )
  const [selectedWaterTypes, setSelectedWaterTypes] = useState<string[]>(
    spot?.water_type ?? []
  )
  const [imagePreview, setImagePreview] = useState<string | null>(
    spot?.map_image_url ?? null
  )
  const [imageRemoved, setImageRemoved] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const userClearedRef = useRef(false)

  const revokeBlob = (url: string | null) => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
  }

  useEffect(() => {
    userClearedRef.current = false
    setImageRemoved(false)
  }, [spot?.id])

  useEffect(() => {
    setKiteZonesJson(serializeKiteZonesForForm(spot?.kite_zones))
  }, [spot?.id, spot?.kite_zones])

  useEffect(() => {
    if (!userClearedRef.current && spot?.map_image_url && !imageInputRef.current?.files?.length) {
      setImagePreview(spot.map_image_url)
    }
  }, [spot?.map_image_url])

  useEffect(() => {
    return () => revokeBlob(imagePreview)
  }, [imagePreview])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageRemoved(false)
      revokeBlob(imagePreview)
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(spot?.map_image_url ?? null)
    }
  }

  function clearImagePreview() {
    userClearedRef.current = true
    setImageRemoved(true)
    revokeBlob(imagePreview)
    setImagePreview(null)
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    formData.delete("windDirections")
    formData.delete("waterType")
    selectedWindDirs.forEach((d) => formData.append("windDirections", d))
    selectedWaterTypes.forEach((t) => formData.append("waterType", t))

    if (spot) {
      formData.set("id", spot.id)
      if (imageRemoved) formData.set("removeImage", "true")
    }

    onSubmit(formData)
  }

  const footer =
    layout === "dialog" ? (
      <DialogFooter>
        <DialogClose render={<Button variant="outlinePrimaryLift" size="lg" />}>
          Avbryt
        </DialogClose>
        <Button
          type="submit"
          variant="primaryLift"
          size="lg"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {spot ? "Lagre" : "Opprett"}
        </Button>
      </DialogFooter>
    ) : (
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Link
          href={cancelHref}
          className={cn(buttonVariants({ variant: "outlinePrimaryLift", size: "lg" }))}
        >
          Avbryt
        </Link>
        <Button
          type="submit"
          variant="primaryLift"
          size="lg"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {spot ? "Lagre" : "Opprett"}
        </Button>
      </div>
    )

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Navn *</label>
        <input
          name="name"
          required
          defaultValue={spot?.name ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Beskrivelse</label>
        <textarea
          name="description"
          defaultValue={spot?.description ?? ""}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Område *</label>
          <input
            name="area"
            list={`area-list-${spot?.id ?? "new"}`}
            required
            autoComplete="off"
            defaultValue={spot?.area ?? ""}
            placeholder="Velg eller skriv nytt område"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
          <datalist id={`area-list-${spot?.id ?? "new"}`}>
            {areas.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sesong</label>
          <select
            name="season"
            defaultValue={spot?.season ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          >
            <option value="">Velg...</option>
            {SPOT_FORM_SEASONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ferdighetsnivå</label>
          <select
            name="skillLevel"
            defaultValue={spot?.skill_level ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          >
            <option value="">Velg...</option>
            {SPOT_FORM_SKILL_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ferdighetstips</label>
          <input
            name="skillNotes"
            defaultValue={spot?.skill_notes ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-3 items-end">
        <Button
          type="button"
          variant="primaryLift"
          size="sm"
          className="h-10"
          onClick={() => setMapModalOpen(true)}
          title="Velg posisjon på kart"
        >
          <MapPin className="h-4 w-4" />
          Kart
        </Button>
        <input
          ref={latRef}
          name="latitude"
          type="number"
          step="any"
          placeholder="Breddegrad"
          defaultValue={spot?.latitude ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
        />
        <input
          ref={lngRef}
          name="longitude"
          type="number"
          step="any"
          placeholder="Lengdegrad"
          defaultValue={spot?.longitude ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
        />
      </div>

      <MapCoordinatesModal
        open={mapModalOpen}
        onOpenChange={setMapModalOpen}
        initialLat={
          latRef.current?.value
            ? parseFloat(latRef.current.value)
            : spot?.latitude ?? null
        }
        initialLng={
          lngRef.current?.value
            ? parseFloat(lngRef.current.value)
            : spot?.longitude ?? null
        }
        onConfirm={(lat, lng) => {
          if (latRef.current) latRef.current.value = String(lat)
          if (lngRef.current) lngRef.current.value = String(lng)
        }}
      />

      <div>
        <label className="block text-sm font-medium mb-2">Velg passende vindretninger</label>
        <AdminWindCompass
          selectedDirections={selectedWindDirs.map((d) => d.toLowerCase())}
          onWindDirectionChange={(dirs) =>
            setSelectedWindDirs(dirs.map((d) => d.toUpperCase()))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Vanntype</label>
        <div className="flex flex-wrap gap-2">
          {WATER_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setSelectedWaterTypes((prev) =>
                  prev.includes(type)
                    ? prev.filter((t) => t !== type)
                    : [...prev, type]
                )
              }
              className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                selectedWaterTypes.includes(type)
                  ? "border-primary bg-primary-muted text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name="kiteZones" value={kiteZonesJson} readOnly />

      <div>
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-11 sm:w-auto"
          onClick={() => setKiteZonesModalOpen(true)}
        >
          Skraver områder
        </Button>
      </div>

      <KiteZonesModal
        open={kiteZonesModalOpen}
        onOpenChange={setKiteZonesModalOpen}
        formJson={kiteZonesJson}
        centerLat={
          latRef.current?.value
            ? parseFloat(latRef.current.value)
            : spot?.latitude ?? null
        }
        centerLng={
          lngRef.current?.value
            ? parseFloat(lngRef.current.value)
            : spot?.longitude ?? null
        }
        onCommit={setKiteZonesJson}
      />

      <div>
        <label className="block text-sm font-medium mb-1">Bilde</label>
        <div className="mt-1 mb-2 rounded-lg border border-border overflow-hidden bg-muted/30 min-h-40 flex items-center justify-center">
          {imagePreview ? (
            <img
              key={imagePreview}
              src={imagePreview}
              alt="Forhåndsvisning"
              className="w-full h-40 object-cover block"
            />
          ) : (
            <span className="text-sm text-muted-foreground py-8">
              Ingen forhåndsvisning
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-md bg-primary-muted px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-muted/80">
            Velg fil
            <input
            ref={imageInputRef}
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleImageChange}
          />
          </label>
          {imagePreview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={clearImagePreview}
            >
              Fjern
            </Button>
          )}
        </div>
      </div>

      {footer}
    </form>
  )
}
