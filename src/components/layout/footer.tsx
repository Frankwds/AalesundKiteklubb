import Link from "next/link"
import { Facebook, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-6xl px-4 pb-6">
        <div className="rounded-none md:rounded-b-xl bg-card px-6 py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ålesund Kiteklubb
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="https://www.facebook.com/groups/219320601753203"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Link>
              <Link
                href="mailto:kontakt@alesundkiteklubb.no"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                Kontakt oss
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
