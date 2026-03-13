import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/logger"

const COURSE_SELECT = "*, instructors(*), spots(*)" as const

export async function getCoursesForPublicPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_SELECT)
    .gte("start_time", new Date().toISOString())
    .order("start_time")

  if (error) {
    logError("getCoursesForPublicPage", error)
    return []
  }

  return data
}

export async function getCoursesForAdmin() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_SELECT)
    .order("start_time")

  if (error) {
    logError("getCoursesForAdmin", error)
    return []
  }

  return data
}

export async function getCoursesForInstructor() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    logError("getCoursesForInstructor", "No authenticated user")
    return []
  }

  const { data: instructor, error: instructorError } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (instructorError || !instructor) {
    logError("getCoursesForInstructor", instructorError ?? "No instructor profile found")
    return []
  }

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_SELECT)
    .eq("instructor_id", instructor.id)
    .order("start_time")

  if (error) {
    logError("getCoursesForInstructor", error)
    return []
  }

  return data
}
