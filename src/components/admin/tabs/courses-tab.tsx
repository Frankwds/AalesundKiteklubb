"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2, Users, Loader2, X } from "lucide-react"
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
import { formatCourseTime } from "@/lib/utils/date"
import { deleteCourse } from "@/lib/actions/courses"
import { createClient } from "@/lib/supabase/client"
import type { CourseWithFullRelations } from "@/lib/queries/courses"

type Participant = {
  id: string
  user_id: string
  users: { name: string | null; email: string } | null
}

type Props = {
  courses: CourseWithFullRelations[]
}

export function CoursesTab({ courses }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
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
      <p className="text-sm text-muted-foreground">
        {courses.length} kurs totalt
      </p>

      <div className="overflow-x-auto rounded-lg border border-border [contain:layout]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Tittel</th>
              <th className="px-4 py-3 font-medium">Tidspunkt</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Spot</th>
              <th className="px-4 py-3 font-medium">Instruktør</th>
              <th className="px-4 py-3 font-medium sr-only">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Ingen kurs ennå
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                const isUpcoming = new Date(course.start_time) > now
                return (
                  <tr key={course.id} className="hover:bg-muted/30">
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
                    <td className="px-4 py-3 text-muted-foreground">
                      {course.instructors?.users?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slett kurs</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette kurset «{deleteTarget?.title}»?
              Alle påmeldte vil bli varslet via e-post om at kurset er avlyst.
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
                ? "Laster deltakere..."
                : `${participants.length} deltaker${participants.length !== 1 ? "e" : ""}`}
            </DialogDescription>
          </DialogHeader>

          {loadingParticipants ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : participants.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Ingen påmeldte
            </p>
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
