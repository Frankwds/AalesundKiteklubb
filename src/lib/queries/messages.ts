import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/logger"

export async function getMessages(courseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("messages")
    .select("*, users(name, avatar_url)")
    .eq("course_id", courseId)
    .order("created_at")

  if (error) {
    logError("getMessages", error)
    return []
  }

  return data
}
