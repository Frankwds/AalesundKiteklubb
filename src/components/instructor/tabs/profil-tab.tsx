"use client"

import { useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateInstructorProfile } from "@/lib/actions/instructors"
import type { getInstructorByUserId } from "@/lib/queries/instructors"

type InstructorProfile = NonNullable<Awaited<ReturnType<typeof getInstructorByUserId>>>

type Props = {
  instructor: InstructorProfile
}

export function ProfilTab({ instructor }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  const users = instructor.users as { name: string | null; avatar_url: string | null } | null
  const photoUrl = instructor.photo_url ?? users?.avatar_url ?? null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    const photo = formData.get("photo") as File | null
    if (photo && photo.size === 0) {
      formData.delete("photo")
    }

    startTransition(async () => {
      const result = await updateInstructorProfile(formData)
      if (result.success) {
        toast.success("Profil oppdatert")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={photoUrl ?? undefined} alt="" />
          <AvatarFallback className="text-lg">
            {users?.name?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{users?.name ?? "Instruktør"}</p>
          <p className="text-sm text-muted-foreground">
            Rediger din instruktørprofil
          </p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Profilbilde</label>
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-sky-700 hover:file:bg-sky-100"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Valgfritt. JPEG, PNG eller WebP. Max 2 MB.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            defaultValue={instructor.bio ?? ""}
            rows={4}
            maxLength={2000}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-y"
            placeholder="Fortell litt om deg selv som instruktør..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sertifiseringer</label>
          <input
            name="certifications"
            type="text"
            defaultValue={instructor.certifications ?? ""}
            maxLength={500}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="F.eks. IKO Level 2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">År med erfaring</label>
            <input
              name="yearsExperience"
              type="number"
              min={0}
              max={100}
              defaultValue={instructor.years_experience ?? ""}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              name="phone"
              type="text"
              defaultValue={instructor.phone ?? ""}
              maxLength={30}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="+47 xxx xx xxx"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="bg-sky-600 hover:bg-sky-700 text-white"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lagre profil
        </Button>
      </form>
    </div>
  )
}
