"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { unenrollFromCourse } from "@/lib/actions/courses"

interface UnenrollDialogProps {
  courseId: string
  courseTitle: string
}

export function UnenrollDialog({ courseId, courseTitle }: UnenrollDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleUnenroll() {
    startTransition(async () => {
      const result = await unenrollFromCourse(courseId)
      if (result.success) {
        setOpen(false)
        toast.success("Du er avmeldt")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outlinePrimaryLift" size="sm" />}>
        Meld av
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Meld av kurs</DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil melde deg av{" "}
            <strong>{courseTitle}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outlinePrimaryLift" size="lg" />}>
            Avbryt
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleUnenroll}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Meld av
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
