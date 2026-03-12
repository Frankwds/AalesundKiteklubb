export function Footer() {
  return (
    <footer className="relative mx-auto w-full max-w-5xl bg-offwhite border-t px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground sm:text-base sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Ålesund Kiteklubb</p>
        <div className="flex gap-4">
          <a
            href="https://www.facebook.com/groups/aalesundkiteklubb"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  )
}
