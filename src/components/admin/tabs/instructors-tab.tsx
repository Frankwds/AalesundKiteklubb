"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, Search } from "lucide-react"
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
import { formatDate } from "@/lib/utils/date"
import { promoteToInstructor, demoteToUser } from "@/lib/actions/instructors"
import type { CurrentUser } from "@/lib/auth"

type Instructor = {
  id: string
  user_id: string
  certifications: string | null
  created_at: string
  users: {
    id: string
    name: string | null
    email: string
  } | null
}

type User = {
  id: string
  name: string | null
  email: string
  role: string
}

type Props = {
  instructors: Instructor[]
  users: User[]
  currentUser: CurrentUser
}

export function InstructorsTab({ instructors, users, currentUser }: Props) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Instructor | null>(null)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")

  const instructorUserIds = useMemo(
    () => new Set(instructors.map((i) => i.user_id)),
    [instructors]
  )

  const eligibleUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === "user" && !instructorUserIds.has(u.id)
    )
  }, [users, instructorUserIds])

  const filteredEligible = useMemo(() => {
    if (!searchQuery.trim()) return eligibleUsers
    const q = searchQuery.toLowerCase()
    return eligibleUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
  }, [eligibleUsers, searchQuery])

  function handleAdd(userId: string) {
    startTransition(async () => {
      const result = await promoteToInstructor(userId)
      if (result.success) {
        setAddOpen(false)
        setSearchQuery("")
        toast.success("Bruker lagt til som instruktør")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleRemove(userId: string) {
    startTransition(async () => {
      const result = await demoteToUser(userId)
      if (result.success) {
        setRemoveTarget(null)
        toast.success("Instruktør fjernet")
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
          {instructors.length} instruktør{instructors.length !== 1 && "er"}
        </p>
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setSearchQuery("") }}>
          <DialogTrigger
            render={<Button size="sm" className="bg-primary hover:bg-primary/90 text-white btn-lift" />}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Legg til instruktør
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Legg til instruktør</DialogTitle>
              <DialogDescription>
                Søk etter en bruker og gi dem instruktørrollen.
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Søk etter navn eller e-post..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <div className="max-h-60 overflow-y-auto rounded-md border border-border divide-y">
              {filteredEligible.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {searchQuery ? "Ingen brukere funnet" : "Ingen tilgjengelige brukere"}
                </p>
              ) : (
                filteredEligible.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{u.name ?? "Uten navn"}</p>
                      <p className="text-muted-foreground truncate text-xs">{u.email}</p>
                    </div>
                    <Button
                      size="sm"
                      className="ml-2 shrink-0 bg-primary hover:bg-primary/90 text-white btn-lift"
                      disabled={isPending}
                      onClick={() => handleAdd(u.id)}
                    >
                      {isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                      Legg til
                    </Button>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Lukk
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border [contain:layout]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Navn</th>
              <th className="px-4 py-3 font-medium">E-post</th>
              <th className="px-4 py-3 font-medium">Sertifiseringer</th>
              <th className="px-4 py-3 font-medium">Lagt til</th>
              <th className="px-4 py-3 font-medium sr-only">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {instructors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Ingen instruktører ennå
                </td>
              </tr>
            ) : (
              instructors.map((inst) => (
                <tr key={inst.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {inst.users?.name ?? "Uten navn"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inst.users?.email ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inst.certifications ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(inst.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inst.user_id !== currentUser.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRemoveTarget(inst)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!removeTarget} onOpenChange={(o) => { if (!o) setRemoveTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fjern instruktør</DialogTitle>
            <DialogDescription>
              Denne brukeren er instruktør. Å fjerne instruktørrollen vil slette
              instruktørprofilen. Kurs tilknyttet denne instruktøren vil miste
              sin instruktørtilknytning. Vil du fortsette?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Avbryt
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => removeTarget && handleRemove(removeTarget.user_id)}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Bekreft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
