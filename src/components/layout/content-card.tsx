import { cn } from '@/lib/utils'

export function ContentCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        'relative mx-auto w-full max-w-5xl bg-offwhite px-4 py-8 sm:px-6 lg:px-8 min-h-[calc(100vh-8rem)]',
        className,
      )}
    >
      {children}
    </main>
  )
}
