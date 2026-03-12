"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  async function handleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">Logg inn</h1>
        <p className="text-muted-foreground">
          Logg inn med Google-kontoen din for å melde deg på kurs og
          abonnere på oppdateringer.
        </p>
        <Button onClick={handleSignIn} size="lg" className="w-full">
          Logg inn med Google
        </Button>
      </div>
    </div>
  )
}
