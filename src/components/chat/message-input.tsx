"use client"

import { useRef, useTransition } from "react"
import { Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { sendMessage } from "@/lib/actions/messages"

interface MessageInputProps {
  courseId: string
}

export function MessageInput({ courseId }: MessageInputProps) {
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = inputRef.current
    if (!input) return

    const content = input.value.trim()
    if (!content) return

    startTransition(async () => {
      const result = await sendMessage(courseId, content)
      if (result.success) {
        input.value = ""
        input.focus()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border px-4 py-3 flex items-center gap-2"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Skriv en melding..."
        disabled={isPending}
        autoFocus
        className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 disabled:opacity-50 placeholder:text-muted-foreground"
      />
      <Button
        type="submit"
        size="icon"
        disabled={isPending}
        className="bg-sky-600 hover:bg-sky-700 text-white shrink-0"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  )
}
