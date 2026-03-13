import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden px-4 py-4 space-y-4">
        {/* Left-aligned messages */}
        <div className="flex items-start gap-2 max-w-[75%]">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
        </div>
        <div className="flex items-start gap-2 max-w-[75%]">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-14 w-56 rounded-lg" />
          </div>
        </div>

        {/* Right-aligned (own) messages */}
        <div className="flex items-start gap-2 max-w-[75%] ml-auto flex-row-reverse">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="space-y-1.5 flex flex-col items-end">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
        </div>

        <div className="flex items-start gap-2 max-w-[75%]">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-52 rounded-lg" />
          </div>
        </div>

        <div className="flex items-start gap-2 max-w-[75%] ml-auto flex-row-reverse">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="space-y-1.5 flex flex-col items-end">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-14 w-60 rounded-lg" />
          </div>
        </div>

        <div className="flex items-start gap-2 max-w-[75%]">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-border px-4 py-3 flex items-center gap-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  )
}
