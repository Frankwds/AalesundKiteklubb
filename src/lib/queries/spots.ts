import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/logger"

export async function getSpots() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("spots").select("*")

  if (error) {
    logError("getSpots", error)
    return []
  }

  return data
}

export async function getSpot(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    logError("getSpot", error)
    return null
  }

  return data
}
