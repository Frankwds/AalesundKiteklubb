"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Noe gikk galt
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        En uventet feil oppstod. Prøv igjen senere.
      </p>
      <Button onClick={reset} className="bg-sky-600 hover:bg-sky-700 text-white">
        Prøv igjen
      </Button>
    </div>
  )
}
