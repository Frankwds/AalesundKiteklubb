import { createClient } from "@/lib/supabase/server"
import { decodeJwtPayload } from "./decode-jwt"

export type UserRole = "user" | "instructor" | "admin"

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: UserRole
}

/**
 * Get the current user with role from the JWT.
 * Uses getSession() + JWT decode — no DB query needed.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const jwt = decodeJwtPayload(session.access_token)
  const role = (jwt.user_role as UserRole) ?? "user"

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.user_metadata.full_name ?? null,
    avatarUrl: session.user.user_metadata.avatar_url ?? null,
    role,
  }
}
