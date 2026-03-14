"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils/date"

export interface UserProfile {
  name: string | null
  avatarUrl: string | null
}

interface MessageBubbleProps {
  message: {
    id: string
    user_id: string | null
    content: string
    created_at: string
  }
  profile: UserProfile | null
  isOwnMessage: boolean
}

export function MessageBubble({
  message,
  profile,
  isOwnMessage,
}: MessageBubbleProps) {
  const isDeletedUser = message.user_id === null
  const displayName = isDeletedUser
    ? "Slettet bruker"
    : profile?.name ?? "..."
  const avatarUrl = isDeletedUser ? null : profile?.avatarUrl ?? null
  const fallbackLetter = isDeletedUser
    ? "X"
    : displayName === "..."
      ? "?"
      : (displayName.charAt(0).toUpperCase() || "?")

  return (
    <div
      className={cn(
        "flex items-start gap-2 max-w-[80%]",
        isOwnMessage && "ml-auto flex-row-reverse"
      )}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} />}
        <AvatarFallback>{fallbackLetter}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-0.5",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "flex items-baseline gap-2",
            isOwnMessage && "flex-row-reverse"
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            {formatTime(message.created_at)}
          </span>
        </div>

        <div
          className={cn(
            "rounded-xl px-3 py-2 text-sm leading-relaxed",
            isOwnMessage
              ? "bg-primary-muted text-primary"
              : "bg-white border border-border text-foreground"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
