import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getMessages } from "@/lib/queries/messages"
import { createClient } from "@/lib/supabase/server"
import { ChatClient } from "@/components/chat/chat-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", id)
    .single()

  return {
    title: course
      ? `${course.title} — Chat — Ålesund Kiteklubb`
      : "Chat — Ålesund Kiteklubb",
  }
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, instructor_id")
    .eq("id", id)
    .single()

  if (!course) {
    redirect("/courses")
  }

  // Access check: enrolled OR course instructor OR admin
  let hasAccess = user.role === "admin"

  if (!hasAccess) {
    const { data: enrollment } = await supabase
      .from("course_participants")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", id)
      .maybeSingle()

    if (enrollment) {
      hasAccess = true
    }
  }

  if (!hasAccess && course.instructor_id) {
    const { data: instructor } = await supabase
      .from("instructors")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (instructor && instructor.id === course.instructor_id) {
      hasAccess = true
    }
  }

  if (!hasAccess) {
    redirect("/courses?error=not_enrolled")
  }

  // Fetch initial messages and instructor profile in parallel
  const [messages, instructorProfile] = await Promise.all([
    getMessages(id),
    fetchInstructorProfile(supabase, course.instructor_id),
  ])

  return (
    <ChatClient
      courseId={id}
      courseTitle={course.title}
      initialMessages={messages}
      currentUser={user}
      instructorProfile={instructorProfile}
    />
  )
}

async function fetchInstructorProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  instructorId: string | null
) {
  if (!instructorId) return null

  const { data } = await supabase
    .from("instructors")
    .select("user_id, users(id, name, avatar_url)")
    .eq("id", instructorId)
    .single()

  if (!data?.users) return null

  const users = data.users as unknown as {
    id: string
    name: string | null
    avatar_url: string | null
  }

  return {
    id: users.id,
    name: users.name,
    avatarUrl: users.avatar_url,
  }
}
