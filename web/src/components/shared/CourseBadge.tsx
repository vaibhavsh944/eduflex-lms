import { cn } from '@/lib/utils'
import type { CourseStatus } from '@/lib/types'

interface CourseBadgeProps {
  status: CourseStatus
  className?: string
}

const variants: Record<CourseStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export function CourseBadge({ status, className }: CourseBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
