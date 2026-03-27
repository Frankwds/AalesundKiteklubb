"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SpotForm, type SpotFormSpot } from "@/components/spots/spot-form"
import { createSpot } from "@/lib/actions/spots"

export function AddSpotPageClient({ spots }: { spots: SpotFormSpot[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createSpot(formData)
      if (result.success) {
        toast.success("Spot opprettet")
        router.push(`/spots/${result.spot.id}`)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <SpotForm
      spots={spots}
      isPending={isPending}
      onSubmit={handleCreate}
      layout="page"
      cancelHref="/spots"
    />
  )
}
