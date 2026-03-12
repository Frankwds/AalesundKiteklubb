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
        'relative mx-auto w-full max-w-5xl flex-1 rounded-t-2xl bg-white/60 px-4 py-8 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </main>
  )
}
