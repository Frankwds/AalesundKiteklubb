"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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
import { formatDate } from "@/lib/utils/date"
import {
  promoteToInstructor,
  promoteToAdmin,
  demoteToUser,
  demoteAdminToInstructor,
} from "@/lib/actions/instructors"
import type { CurrentUser } from "@/lib/auth"

type User = {
  id: string
  name: string | null
  email: string
  role: string
  created_at: string
}

type RoleChange = {
  user: User
  newRole: string
}

type Props = {
  users: User[]
  currentUser: CurrentUser
}

const ROLE_LABELS: Record<string, string> = {
  user: "Bruker",
  instructor: "Instruktør",
  admin: "Admin",
}

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  instructor: "secondary",
  user: "outline",
}

function getConfirmationMessage(currentRole: string, newRole: string): string | null {
  if (newRole === "user" && currentRole === "instructor") {
    return "Denne brukeren er instruktør. Å endre rollen til bruker vil slette instruktørprofilen. Kurs tilknyttet denne instruktøren vil miste sin instruktørtilknytning. Vil du fortsette?"
  }
  if (newRole === "user" && currentRole === "admin") {
    return "Denne brukeren er admin. Å endre rollen til bruker vil fjerne admin-tilgangen og slette instruktørprofilen. Kurs tilknyttet denne brukeren vil miste sin instruktørtilknytning. Vil du fortsette?"
  }
  if (newRole === "instructor" && currentRole === "admin") {
    return "Denne brukeren er admin. Å endre rollen til instruktør vil fjerne admin-tilgangen, men beholde instruktørprofilen. Vil du fortsette?"
  }
  return null
}

export function UsersTab({ users, currentUser }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingChange, setPendingChange] = useState<RoleChange | null>(null)

  function executeRoleChange(userId: string, currentRole: string, newRole: string) {
    startTransition(async () => {
      let result: { success: boolean; error?: string }

      if (newRole === "user") {
        result = await demoteToUser(userId)
      } else if (newRole === "instructor" && currentRole === "admin") {
        result = await demoteAdminToInstructor(userId)
      } else if (newRole === "instructor") {
        result = await promoteToInstructor(userId)
      } else if (newRole === "admin") {
        result = await promoteToAdmin(userId)
      } else {
        return
      }

      if (result.success) {
        setPendingChange(null)
        toast.success("Rolle oppdatert")
        router.refresh()
      } else {
        toast.error(result.error ?? "Noe gikk galt")
      }
    })
  }

  function handleRoleSelect(user: User, newRole: string) {
    if (newRole === user.role) return

    const confirmMsg = getConfirmationMessage(user.role, newRole)
    if (confirmMsg) {
      setPendingChange({ user, newRole })
    } else {
      executeRoleChange(user.id, user.role, newRole)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {users.length} bruker{users.length !== 1 && "e"}
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Navn</th>
              <th className="px-4 py-3 font-medium">E-post</th>
              <th className="px-4 py-3 font-medium">Rolle</th>
              <th className="px-4 py-3 font-medium">Registrert</th>
              <th className="px-4 py-3 font-medium">Endre rolle</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Ingen brukere
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isOwnRow = user.id === currentUser.id
                return (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {user.name ?? "Uten navn"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_VARIANTS[user.role] ?? "outline"}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={user.role}
                          disabled={isOwnRow || isPending}
                          onChange={(e) => handleRoleSelect(user, e.target.value)}
                          title={
                            isOwnRow
                              ? "Du kan ikke endre din egen rolle"
                              : "Endre rolle"
                          }
                          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="user">Bruker</option>
                          <option value="instructor">Instruktør</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Role change confirmation dialog */}
      <Dialog
        open={!!pendingChange}
        onOpenChange={(o) => { if (!o) setPendingChange(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekreft rolleendring</DialogTitle>
            <DialogDescription>
              {pendingChange &&
                getConfirmationMessage(
                  pendingChange.user.role,
                  pendingChange.newRole
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Avbryt
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                pendingChange &&
                executeRoleChange(
                  pendingChange.user.id,
                  pendingChange.user.role,
                  pendingChange.newRole
                )
              }
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
