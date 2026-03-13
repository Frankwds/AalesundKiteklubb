"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { MessageBubble, type UserProfile } from "./message-bubble"
import { MessageInput } from "./message-input"
import type { CurrentUser } from "@/lib/auth"

interface Message {
  id: string
  course_id: string
  user_id: string | null
  content: string
  created_at: string
}

interface InitialMessage extends Message {
  users: { name: string | null; avatar_url: string | null } | null
}

interface ChatClientProps {
  courseId: string
  courseTitle: string
  initialMessages: InitialMessage[]
  currentUser: CurrentUser
  instructorProfile: { id: string; name: string | null; avatarUrl: string | null } | null
}

export function ChatClient({
  courseId,
  courseTitle,
  initialMessages,
  currentUser,
  instructorProfile,
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const profileCache = useRef<Map<string, UserProfile>>(new Map())
  const [profileVersion, setProfileVersion] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Seed profile cache from initial messages + instructor
  useEffect(() => {
    for (const msg of initialMessages) {
      if (msg.user_id && msg.users) {
        profileCache.current.set(msg.user_id, {
          name: msg.users.name,
          avatarUrl: msg.users.avatar_url,
        })
      }
    }

    profileCache.current.set(currentUser.id, {
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
    })

    if (instructorProfile) {
      profileCache.current.set(instructorProfile.id, {
        name: instructorProfile.name,
        avatarUrl: instructorProfile.avatarUrl,
      })
    }
  }, [initialMessages, currentUser, instructorProfile])

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Auto-scroll on new messages
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom()
    }
  }, [messages, isNearBottom, scrollToBottom])

  // Scroll to bottom on initial load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView()
  }, [])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`chat-${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `course_id=eq.${courseId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message

          // Don't add duplicate messages
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          if (newMsg.user_id === null) {
            // Deleted user — no fetch needed
            return
          }

          if (profileCache.current.has(newMsg.user_id)) {
            // Already cached
            return
          }

          // On-demand fetch for unknown user
          const { data } = await supabase
            .from("users")
            .select("name, avatar_url")
            .eq("id", newMsg.user_id)
            .single()

          if (data) {
            profileCache.current.set(newMsg.user_id, {
              name: data.name,
              avatarUrl: data.avatar_url,
            })
          } else {
            profileCache.current.set(newMsg.user_id, {
              name: "Ukjent bruker",
              avatarUrl: null,
            })
          }

          // Trigger re-render so the profile shows
          setProfileVersion((v) => v + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [courseId])

  // Suppress unused variable lint — profileVersion is used to trigger re-renders
  void profileVersion

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/courses"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold text-foreground truncate">
          {courseTitle}
        </h1>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Ingen meldinger ennå. Skriv den første!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              profile={
                msg.user_id
                  ? profileCache.current.get(msg.user_id) ?? null
                  : null
              }
              isOwnMessage={msg.user_id === currentUser.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput courseId={courseId} />
    </div>
  )
}
