import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  count?: number
  className?: string
}

export function SkeletonCard({ count = 1, className }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
          <div className="aspect-video bg-muted animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-5 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-2 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </>
  )
}
