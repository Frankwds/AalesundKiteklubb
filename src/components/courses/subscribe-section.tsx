"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Bell, Loader2, Check } from "lucide-react"
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
import { subscribe, unsubscribe } from "@/lib/actions/subscriptions"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"
import type { CurrentUser } from "@/lib/auth"
import type { Database } from "@/types/database"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]

interface SubscribeSectionProps {
  user: CurrentUser | null
  subscription: Subscription | null
}

export function SubscribeSection({ user, subscription }: SubscribeSectionProps) {
  return (
    <section
      id="subscribe-section"
      className="rounded-lg border border-border bg-white p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-5 w-5 text-sky-600" />
        <h2 className="text-lg font-semibold text-foreground">Varsler</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Få e-postvarsler når nye kurs publiseres, slik at du aldri går glipp av
        et kurs.
      </p>

      {!user ? (
        <Link
          href="/login"
          className={cn(
            buttonVariants({ size: "sm" }),
            "bg-sky-600 hover:bg-sky-700 text-white"
          )}
        >
          Logg inn for å motta kursvarsler
        </Link>
      ) : subscription ? (
        <SubscribedState />
      ) : (
        <UnsubscribedState email={user.email} />
      )}
    </section>
  )
}

function UnsubscribedState({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubscribe() {
    startTransition(async () => {
      const result = await subscribe()
      if (result.success) {
        setOpen(false)
        toast.success("Du vil få varsler om nye kurs")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          buttonVariants({ size: "sm" }),
          "bg-sky-600 hover:bg-sky-700 text-white"
        )}
      >
        <Bell className="mr-2 h-4 w-4" />
        Meld på varsler
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Meld på kursvarsler</DialogTitle>
          <DialogDescription>
            Du vil motta en e-post hver gang et nytt kurs publiseres.
            Varsler sendes til:
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {email}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Avbryt
          </DialogClose>
          <Button
            className="bg-sky-600 hover:bg-sky-700 text-white"
            disabled={isPending}
            onClick={handleSubscribe}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Meld på
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SubscribedState() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleUnsubscribe() {
    startTransition(async () => {
      const result = await unsubscribe()
      if (result.success) {
        setOpen(false)
        toast.success("Du mottar ikke lenger kursvarsler")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-green-700">
        <Check className="h-4 w-4" />
        <span>Du mottar varsler om nye kurs</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          Meld av varsler
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meld av kursvarsler</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slutte å motta kursvarsler?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Avbryt
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleUnsubscribe}
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Meld av
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
