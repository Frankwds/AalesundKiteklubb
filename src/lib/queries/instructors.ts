import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/logger"

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
