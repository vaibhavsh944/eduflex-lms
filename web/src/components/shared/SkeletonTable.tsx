import { cn } from '@/lib/utils'

interface SkeletonTableProps {
  rows?: number
  cols?: number
  className?: string
}

export function SkeletonTable({ rows = 5, cols = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      <div className="grid grid-cols-1 divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 p-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-5 bg-muted rounded animate-pulse"
                style={{ width: `${Math.max(60, 100 - c * 10)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
