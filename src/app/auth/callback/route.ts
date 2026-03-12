import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { UserSyncSchema } from "@/lib/validations/user-sync"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
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

  return NextResponse.redirect(`${origin}${next}`)
}
