import { cn } from '@/lib/utils'

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className,
      )}
    />
  )
}

export function SkeletonSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-sky-600" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-3 w-1/2" />
      <Shimmer className="h-3 w-5/6" />
      <Shimmer className="h-8 w-24 mt-2" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      <Shimmer className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Shimmer key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="space-y-4">
      <Shimmer className="h-6 w-1/3" />
      <Shimmer className="h-4 w-2/3" />
      <Shimmer className="h-48 w-full" />
      <div className="space-y-2">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
        <Shimmer className="h-3 w-4/6" />
      </div>
    </div>
  )
}
