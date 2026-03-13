"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const course = {
  id: "2",
  title: "Videregående kurs",
}

const currentUser = {
  id: "user-1",
  name: "Ola Nordmann",
}

const initialMessages = [
  {
    id: "1",
    userId: "instructor-1",
    userName: "Mari Olsen",
    text: "Hei alle sammen! Velkommen til kurset. Vi møtes på Alnes kl 12:00 på lørdag.",
    timestamp: "09:15",
    isCurrentUser: false,
  },
  {
    id: "2",
    userId: "user-2",
    userName: "Kari Svendsen",
    text: "Supert! Gleder meg. Er det mulig å parkere ved fyret?",
    timestamp: "09:32",
    isCurrentUser: false,
  },
  {
    id: "3",
    userId: "instructor-1",
    userName: "Mari Olsen",
    text: "Ja, det er parkering like ved. Jeg sender mer detaljert info i morgen.",
    timestamp: "09:45",
    isCurrentUser: false,
  },
  {
    id: "4",
    userId: "user-1",
    userName: "Ola Nordmann",
    text: "Takk for info! Skal jeg ta med egen våtdrakt, eller har dere til utlån?",
    timestamp: "10:12",
    isCurrentUser: true,
  },
  {
    id: "5",
    userId: "instructor-1",
    userName: "Mari Olsen",
    text: "Vi har våtdrakter i ulike størrelser til utlån, så du trenger ikke ta med egen. Men ta gjerne med hansker og hette om du har.",
    timestamp: "10:30",
    isCurrentUser: false,
  },
  {
    id: "6",
    userId: "user-3",
    userName: "Per Hansen",
    text: "Hva er varselet for lørdag? Ser ut som det kan bli litt kraftig vind?",
    timestamp: "14:02",
    isCurrentUser: false,
  },
  {
    id: "7",
    userId: "instructor-1",
    userName: "Mari Olsen",
    text: "Vi følger med på været. Det ser ut til å bli 8-10 m/s fra vest, som er perfekt for kurset. Jeg gir beskjed om det blir endringer.",
    timestamp: "14:32",
    isCurrentUser: false,
  },
]

export default function CourseChatPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return

    const message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" }),
      isCurrentUser: true,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Link
          href="/courses"
          className="flex items-center text-sm text-muted-foreground hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Tilbake til kurs
        </Link>
        <span className="text-muted-foreground">|</span>
        <h1 className="font-semibold text-foreground">{course.title}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv en melding..."
            className="flex-1 px-4 py-2 h-11 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="h-11 w-11 p-0 bg-sky-600 hover:bg-sky-700"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send melding</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: typeof initialMessages[0] }) {
  return (
    <div
      className={cn(
        "flex gap-3",
        message.isCurrentUser && "flex-row-reverse"
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs",
            message.isCurrentUser
              ? "bg-sky-600 text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          {message.userName.split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[75%]",
          message.isCurrentUser && "text-right"
        )}
      >
        <div
          className={cn(
            "flex items-baseline gap-2 mb-1",
            message.isCurrentUser && "flex-row-reverse"
          )}
        >
          <span className="text-sm font-medium text-foreground">
            {message.userName}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp}
          </span>
        </div>
        <div
          className={cn(
            "inline-block px-4 py-2 rounded-lg text-sm",
            message.isCurrentUser
              ? "bg-sky-600 text-white rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          )}
        >
          {message.text}
        </div>
      </div>
    </div>
  )
}
