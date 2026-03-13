import { SkeletonCard } from "@/components/ui/skeletons"

export default function CoursesLoading() {
  return (
    <div className="px-6 py-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
