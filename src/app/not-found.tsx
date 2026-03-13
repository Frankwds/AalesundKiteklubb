import Link from "next/link"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-8xl md:text-9xl font-bold text-muted-foreground/30 mb-4">
        404
      </p>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Siden finnes ikke
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Beklager, vi finner ikke siden du leter etter.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants(),
          "bg-sky-600 hover:bg-sky-700 text-white"
        )}
      >
        Tilbake til forsiden
      </Link>
    </div>
  )
}
