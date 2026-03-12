'use client'

import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">Noe gikk galt</h1>
      <p className="text-muted-foreground">
        En uventet feil oppstod. Prøv igjen eller kom tilbake senere.
      </p>
      <Button onClick={reset}>Prøv igjen</Button>
    </div>
  )
}
