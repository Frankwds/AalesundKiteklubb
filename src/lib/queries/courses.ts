import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/logger"
import type { Database } from "@/types/database"

const COURSE_PUBLIC_SELECT = "*, instructors(*), spots(name)" as const
const COURSE_FULL_SELECT = "*, instructors(*, users(name)), spots(name)" as const

type CourseRow = Database["public"]["Tables"]["courses"]["Row"]
type InstructorRow = Database["public"]["Tables"]["instructors"]["Row"]

export type CourseWithRelations = CourseRow & {
  instructors: InstructorRow | null
  spots: { name: string } | null
}

export type CourseWithFullRelations = CourseRow & {
  instructors:
    | (InstructorRow & { users: { name: string | null } | null })
    | null
  spots: { name: string } | null
}

export async function getCoursesForPublicPage(): Promise<CourseWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_PUBLIC_SELECT)
    .gte("start_time", new Date().toISOString())
    .order("start_time")

  if (error) {
    logError("getCoursesForPublicPage", error)
    return []
  }

  return data as unknown as CourseWithRelations[]
}

export async function getCoursesForAdmin(): Promise<CourseWithFullRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_FULL_SELECT)
    .order("start_time")

  if (error) {
    logError("getCoursesForAdmin", error)
    return []
  }

  return data as unknown as CourseWithFullRelations[]
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
    .select(COURSE_FULL_SELECT)
    .eq("instructor_id", instructor.id)
    .order("start_time")

  if (error) {
    logError("getCoursesForInstructor", error)
    return []
  }

  return data as unknown as CourseWithFullRelations[]
}
