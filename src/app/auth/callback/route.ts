import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  AUTH_RETURN_PATH_COOKIE,
  safeReturnPath,
} from "@/lib/auth/return-path"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { UserSyncSchema } from "@/lib/validations/user-sync"

function redirectClearingReturnCookie(url: string) {
  const res = NextResponse.redirect(url)
  res.cookies.set(AUTH_RETURN_PATH_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(AUTH_RETURN_PATH_COOKIE)?.value
  let nextFromCookie: string | undefined
  if (rawCookie) {
    try {
      nextFromCookie = safeReturnPath(decodeURIComponent(rawCookie))
    } catch {
      nextFromCookie = undefined
    }
  }
  const next = nextFromCookie ?? safeReturnPath(searchParams.get("next"))

  if (!code) {
    return redirectClearingReturnCookie(`${origin}/login?error=no_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return redirectClearingReturnCookie(`${origin}/login?error=auth_failed`)
  }

  const user = data.user

  // Upsert into public.users via service role client.
  // The Zod schema structurally prevents `role` from being included,
  // so ON CONFLICT (id) DO UPDATE can never overwrite the admin-managed role.
  const adminClient = createAdminClient()
  const payload = UserSyncSchema.parse({
    id: user.id,
    email: user.email,
    name: user.user_metadata.full_name ?? null,
    avatar_url: user.user_metadata.avatar_url ?? null,
  })

  await adminClient.from("users").upsert(payload, {
    onConflict: "id",
    ignoreDuplicates: false,
  })

  return redirectClearingReturnCookie(`${origin}${next}`)
}
