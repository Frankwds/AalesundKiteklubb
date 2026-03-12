import { Wind } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative mx-auto w-full max-w-5xl border-t border-gray-200/50 bg-white/40 px-4 py-8 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Wind className="size-4" />
          <span>&copy; {new Date().getFullYear()} Ålesund Kiteklubb</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/spots"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Spotter
          </Link>
          <Link
            href="/courses"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Kurs
          </Link>
          <a
            href="https://www.facebook.com/groups/aalesundkiteklubb"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  )
}
