"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { createSpot, updateSpot, deleteSpot } from "@/lib/actions/spots"

type Spot = {
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
  created_at: string
}

type Props = {
  spots: Spot[]
}

const WIND_DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const
const WATER_TYPES = ["flat", "chop", "waves"] as const
const SEASONS = [
  { value: "summer", label: "Sommer" },
  { value: "winter", label: "Vinter" },
] as const
const SKILL_LEVELS = [
  { value: "beginner", label: "Nybegynner" },
  { value: "experienced", label: "Erfaren" },
] as const

function SpotForm({
  spot,
  isPending,
  onSubmit,
}: {
  spot?: Spot
  isPending: boolean
  onSubmit: (formData: FormData) => void
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [selectedWindDirs, setSelectedWindDirs] = useState<string[]>(
    spot?.wind_directions ?? []
  )
  const [selectedWaterTypes, setSelectedWaterTypes] = useState<string[]>(
    spot?.water_type ?? []
  )

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
    }

    onSubmit(formData)
  }

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
            required
            defaultValue={spot?.area ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sesong</label>
          <select
            name="season"
            defaultValue={spot?.season ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          >
            <option value="">Velg...</option>
            {SEASONS.map((s) => (
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
            {SKILL_LEVELS.map((s) => (
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Breddegrad</label>
          <input
            name="latitude"
            type="number"
            step="any"
            defaultValue={spot?.latitude ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lengdegrad</label>
          <input
            name="longitude"
            type="number"
            step="any"
            defaultValue={spot?.longitude ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Vindretninger</label>
        <div className="flex flex-wrap gap-2">
          {WIND_DIRECTIONS.map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() =>
                setSelectedWindDirs((prev) =>
                  prev.includes(dir)
                    ? prev.filter((d) => d !== dir)
                    : [...prev, dir]
                )
              }
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedWindDirs.includes(dir)
                  ? "border-primary bg-primary-muted text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
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

      <div>
        <label className="block text-sm font-medium mb-1">Kartbilde</label>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary-muted/80"
        />
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>
          Avbryt
        </DialogClose>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white btn-lift"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {spot ? "Lagre" : "Opprett"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function SpotsTab({ spots }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Spot | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Spot | null>(null)

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createSpot(formData)
      if (result.success) {
        setCreateOpen(false)
        toast.success("Spot opprettet")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const result = await updateSpot(formData)
      if (result.success) {
        setEditTarget(null)
        toast.success("Spot oppdatert")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(spotId: string) {
    startTransition(async () => {
      const result = await deleteSpot(spotId)
      if (result.success) {
        setDeleteTarget(null)
        toast.success("Spot slettet")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {spots.length} spot{spots.length !== 1 && "s"}
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground btn-lift"
              />
            }
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Ny spot
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ny spot</DialogTitle>
              <DialogDescription>Opprett en ny kitespot.</DialogDescription>
            </DialogHeader>
            <SpotForm isPending={isPending} onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border [contain:layout]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Navn</th>
              <th className="px-4 py-3 font-medium">Område</th>
              <th className="px-4 py-3 font-medium">Sesong</th>
              <th className="px-4 py-3 font-medium">Nivå</th>
              <th className="px-4 py-3 font-medium">Vanntype</th>
              <th className="px-4 py-3 font-medium sr-only">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {spots.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Ingen spotter ennå
                </td>
              </tr>
            ) : (
              spots.map((spot) => (
                <tr key={spot.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{spot.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{spot.area}</td>
                  <td className="px-4 py-3">
                    {spot.season ? (
                      <Badge variant="secondary">
                        {spot.season === "summer" ? "Sommer" : "Vinter"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {spot.skill_level
                      ? spot.skill_level === "beginner"
                        ? "Nybegynner"
                        : "Erfaren"
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {spot.water_type && spot.water_type.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {spot.water_type.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs capitalize">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTarget(spot)}
                        title="Rediger"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(spot)}
                        title="Slett"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger spot</DialogTitle>
            <DialogDescription>Oppdater spotinformasjonen.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <SpotForm
              spot={editTarget}
              isPending={isPending}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slett spot</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette «{deleteTarget?.name}»? Denne
              handlingen kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Avbryt
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Slett
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
