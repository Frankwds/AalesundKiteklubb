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
import { enrollInCourse } from "@/lib/actions/courses"

interface EnrollDialogProps {
  courseId: string
  courseTitle: string
  userEmail: string
}

export function EnrollDialog({
  courseId,
  courseTitle,
  userEmail,
}: EnrollDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleEnroll() {
    startTransition(async () => {
      const result = await enrollInCourse(courseId)
      if (result.success) {
        setOpen(false)
        toast.success("Du er påmeldt!")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="primaryLift" size="lg" />}>
        Meld på
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Meld på kurs</DialogTitle>
          <DialogDescription>
            Du melder deg på <strong>{courseTitle}</strong>. En bekreftelse
            sendes til:
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {userEmail}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outlinePrimaryLift" size="lg" />}>
            Avbryt
          </DialogClose>
          <Button
            variant="primaryLift"
            size="lg"
            disabled={isPending}
            onClick={handleEnroll}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Meld på
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
