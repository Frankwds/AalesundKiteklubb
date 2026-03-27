"use client"

import { useState, useTransition } from "react"
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
import {
  SpotForm,
  type SpotFormSpot,
  SPOT_FORM_SEASONS,
  SPOT_FORM_SKILL_LEVELS,
} from "@/components/spots/spot-form"

type Spot = SpotFormSpot

type Props = {
  spots: Spot[]
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
                variant="primaryLift"
                size="lg"
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
            <SpotForm key="create" spots={spots} isPending={isPending} onSubmit={handleCreate} />
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
                  Ingen spots ennå
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
                        {SPOT_FORM_SEASONS.find((s) => s.value === spot.season)?.label ?? "-"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {SPOT_FORM_SKILL_LEVELS.find((s) => s.value === spot.skill_level)?.label ?? "-"}
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

      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger spot</DialogTitle>
            <DialogDescription>Oppdater spotinformasjonen.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <SpotForm
              key={editTarget.id}
              spot={editTarget}
              spots={spots}
              isPending={isPending}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

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
            <DialogClose render={<Button variant="outlinePrimaryLift" size="lg" />}>
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
