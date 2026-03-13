interface ContentCardProps {
  children: React.ReactNode
  className?: string
}

export function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
      <div
        className={`rounded-none md:rounded-xl bg-[#FAFAF8] shadow-lg md:shadow-xl ${className ?? ""}`}
      >
        {children}
      </div>
    </div>
  )
}
