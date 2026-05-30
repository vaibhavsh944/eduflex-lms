export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Thumbnail */}
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        {/* Rating + stars */}
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
        {/* Title */}
        <div className="h-5 w-full rounded bg-muted animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
        {/* Meta */}
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
        </div>
        {/* Price + button */}
        <div className="flex justify-between items-center border-t border-border pt-3">
          <div className="h-6 w-20 rounded bg-muted animate-pulse" />
          <div className="h-5 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}