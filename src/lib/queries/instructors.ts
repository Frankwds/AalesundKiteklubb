import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/logger"

export type InstructorWithUser = Awaited<ReturnType<typeof getInstructors>>[number]

export async function getInstructorByUserId(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("instructors")
    .select("*, users(name, avatar_url)")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code !== "PGRST116") {
      logError("getInstructorByUserId", error)
    }
    return null
  }
  if (!data) return null

  return data
}

export async function getInstructors() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("instructors")
    .select("*, users(*)")

  if (error) {
    logError("getInstructors", error)
    return []
  }

  return data
}
