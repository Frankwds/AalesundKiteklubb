import { createAdminClient } from "@/lib/supabase/admin"
import { logError } from "@/lib/logger"

export async function getAllUsers() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    logError("getAllUsers", error)
    return []
  }

  return data
}
