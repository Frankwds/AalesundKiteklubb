"use client"

import { useState, useTransition, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Users, Pencil, Loader2, X, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { formatCourseTime, buildOsloISO } from "@/lib/utils/date"
import { publishCourse, updateCourse, deleteCourse } from "@/lib/actions/courses"
import { createClient } from "@/lib/supabase/client"
import type { CourseWithFullRelations } from "@/lib/queries/courses"
import type { getSpots } from "@/lib/queries/spots"

type Participant = {
  id: string
  user_id: string
  users: { name: string | null; email: string } | null
}

type Props = {
  courses: CourseWithFullRelations[]
  spots: Awaited<ReturnType<typeof getSpots>>
}

function formatDateForInput(iso: string): string {
  return iso.slice(0, 10)
}

function formatTimeForInput(iso: string): string {
  return iso.slice(11, 16)
}

function CourseForm({
  course,
  spots,
  isPending,
  onSubmit,
  onCancel,
}: {
  course?: CourseWithFullRelations
  spots: Props["spots"]
  isPending: boolean
  onSubmit: (formData: FormData) => void
  onCancel: () => void
}) {
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    const dateStr = formData.get("date") as string
    const startTimeStr = formData.get("startTime") as string
    const endTimeStr = formData.get("endTime") as string

    if (!dateStr || !startTimeStr || !endTimeStr) {
      toast.error("Fyll inn dato og tid")
      return
    }

    formData.set("startTime", buildOsloISO(dateStr, startTimeStr))
    formData.set("endTime", buildOsloISO(dateStr, endTimeStr))
    formData.delete("date")

    onSubmit(formData)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tittel *</label>
        <input
          name="title"
          required
          defaultValue={course?.title ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Beskrivelse</label>
        <textarea
          name="description"
          defaultValue={course?.description ?? ""}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-y"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pris (kr)</label>
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={course?.price ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Maks deltakere</label>
          <input
            name="maxParticipants"
            type="number"
            min={1}
            defaultValue={course?.max_participants ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Dato *</label>
        <input
          name="date"
          type="date"
          required
          defaultValue={course ? formatDateForInput(course.start_time) : ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Starttid *</label>
          <input
            name="startTime"
            type="time"
            required
            defaultValue={course ? formatTimeForInput(course.start_time) : "10:00"}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sluttid *</label>
          <input
            name="endTime"
            type="time"
            required
            defaultValue={course ? formatTimeForInput(course.end_time) : "14:00"}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Spot</label>
        <select
          name="spotId"
          defaultValue={course?.spot_id ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
        >
          <option value="">Velg spot (valgfritt)</option>
          {spots.map((spot) => (
            <option key={spot.id} value={spot.id}>
              {spot.name} ({spot.area})
            </option>
          ))}
        </select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white btn-lift"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {course ? "Lagre" : "Opprett kurs"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function MineKursTab({ courses, spots }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CourseWithFullRelations | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CourseWithFullRelations | null>(null)
  const [participantsTarget, setParticipantsTarget] = useState<CourseWithFullRelations | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  const fetchParticipants = useCallback(async (courseId: string) => {
    setLoadingParticipants(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("course_participants")
      .select("id, user_id, users(name, email)")
      .eq("course_id", courseId)

    if (error) {
      toast.error("Kunne ikke hente deltakere")
      setParticipants([])
    } else {
      setParticipants(data as unknown as Participant[])
    }
    setLoadingParticipants(false)
  }, [])

  useEffect(() => {
    if (participantsTarget) {
      fetchParticipants(participantsTarget.id)
    }
  }, [participantsTarget, fetchParticipants])

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await publishCourse(formData)
      if (result.success) {
        setCreateOpen(false)
        const total = result.notificationsSent + result.notificationsFailed
        if (total === 0) {
          toast.success("Kurs opprettet")
        } else if (result.notificationsFailed === 0) {
          toast.success(`Kurs opprettet. ${result.notificationsSent} varsel sendt.`)
        } else {
          toast.warning(
            `Kurs opprettet. ${result.notificationsSent} av ${total} varsler sendt.`
          )
        }
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleUpdate(courseId: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateCourse(courseId, formData)
      if (result.success) {
        setEditTarget(null)
        toast.success("Kurs oppdatert")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(courseId: string) {
    startTransition(async () => {
      const result = await deleteCourse(courseId)
      if (result.success) {
        setDeleteTarget(null)
        const total = result.cancellationsSent + result.cancellationsFailed
        if (total === 0) {
          toast.success("Kurs slettet")
        } else if (result.cancellationsFailed === 0) {
          toast.success(`Kurs slettet. ${result.cancellationsSent} varsel sendt.`)
        } else {
          toast.warning(
            `Kurs slettet. ${result.cancellationsSent} av ${total} varsler sendt.`
          )
        }
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleRemoveParticipant(participantId: string) {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("course_participants")
        .delete()
        .eq("id", participantId)

      if (error) {
        toast.error("Kunne ikke fjerne deltaker")
      } else {
        toast.success("Deltaker fjernet")
        setParticipants((prev) => prev.filter((p) => p.id !== participantId))
        router.refresh()
      }
    })
  }

  const now = new Date()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {courses.length} kurs totalt
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white btn-lift shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nytt kurs
          </Button>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nytt kurs</DialogTitle>
              <DialogDescription>
                Opprett et nytt kurs. Abonnenter vil bli varslet via e-post.
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              spots={spots}
              isPending={isPending}
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Tittel</th>
              <th className="px-4 py-3 font-medium">Tidspunkt</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Spot</th>
              <th className="px-4 py-3 font-medium sr-only">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                  <p className="font-medium text-foreground">Ditt første kurs venter</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Opprett et kurs og gi folk muligheten til å lære kiting med deg.
                  </p>
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                const isUpcoming = new Date(course.start_time) > now
                return (
                  <tr
                    key={course.id}
                    className="transition-colors duration-150 hover:bg-primary-muted/30"
                  >
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                      {course.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatCourseTime(course.start_time, course.end_time)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={isUpcoming ? "default" : "secondary"}>
                        {isUpcoming ? "Kommende" : "Tidligere"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {course.spots?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTarget(course)}
                          title="Rediger"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setParticipantsTarget(course)}
                          title="Vis deltakere"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(course)}
                          title="Slett kurs"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger kurs</DialogTitle>
            <DialogDescription>
              Oppdater kursinformasjonen.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <CourseForm
              course={editTarget}
              spots={spots}
              isPending={isPending}
              onSubmit={(formData) => handleUpdate(editTarget.id, formData)}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slett kurs</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette kurset «{deleteTarget?.title}»?
              Alle påmeldte vil bli varslet via e-post.
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

      {/* Participants dialog */}
      <Dialog
        open={!!participantsTarget}
        onOpenChange={(o) => {
          if (!o) {
            setParticipantsTarget(null)
            setParticipants([])
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deltakere — {participantsTarget?.title}</DialogTitle>
            <DialogDescription>
              {loadingParticipants
                ? "Sjekker deltakere…"
                : participants.length === 0
                  ? "Ingen påmeldte ennå"
                  : `${participants.length} deltaker${participants.length !== 1 ? "e" : ""}`}
            </DialogDescription>
          </DialogHeader>

          {loadingParticipants ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Sjekker deltakere...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="py-6 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Ingen påmeldte ennå. Deltakerne vil vises her når noen melder seg på.
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto rounded-md border border-border divide-y">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {p.users?.name ?? "Uten navn"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.users?.email ?? "-"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isPending}
                    onClick={() => handleRemoveParticipant(p.id)}
                    title="Fjern deltaker"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Lukk
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
