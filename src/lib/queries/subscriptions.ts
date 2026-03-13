import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logError } from "@/lib/logger"

export async function getUserSubscription(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    logError("getUserSubscription", error)
    return null
  }

  return data
}

export async function getAllSubscriberEmails() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("email")

  if (error) {
    logError("getAllSubscriberEmails", error)
    return []
  }

  return data.map((row) => row.email)
}

export async function getAllSubscriptions() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, users(name)")
    .order("created_at", { ascending: false })

  if (error) {
    logError("getAllSubscriptions", error)
    return []
  }

  return data
}
