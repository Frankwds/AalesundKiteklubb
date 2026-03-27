"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { SpotForm, type SpotFormSpot } from "@/components/spots/spot-form"
import { updateSpot } from "@/lib/actions/spots"
import type { CurrentUser } from "@/lib/auth"

function loginHrefForSpot(spotId: string) {
  return `/login?next=${encodeURIComponent(`/spots/${spotId}`)}`
}

export function SpotDetailPublicEdit({
  user,
  spot,
  allSpots,
}: {
  user: CurrentUser | null
  spot: SpotFormSpot
  allSpots: SpotFormSpot[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const result = await updateSpot(formData)
      if (result.success) {
        setOpen(false)
        toast.success("Spot oppdatert")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const triggerClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "inline-flex items-center gap-2 text-foreground"
  )

  return (
    <>
      {user ? (
        <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
          <Pencil className="h-4 w-4" />
          Rediger spot
        </button>
      ) : (
        <Link href={loginHrefForSpot(spot.id)} className={triggerClass}>
          <Pencil className="h-4 w-4" />
          Rediger spot
        </Link>
      )}

      {user && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rediger spot</DialogTitle>
              <DialogDescription>Oppdater spotinformasjonen.</DialogDescription>
            </DialogHeader>
            <SpotForm
              key={`${spot.id}-${open}`}
              spot={spot}
              spots={allSpots}
              isPending={isPending}
              onSubmit={handleUpdate}
              cancelHref={`/spots/${spot.id}`}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
