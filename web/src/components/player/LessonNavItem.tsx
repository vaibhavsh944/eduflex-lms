import React from 'react'
import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import { LessonTypeBadge } from '@/components/common/LessonTypeBadge'
import type { PlayerLesson } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Link, useParams } from 'react-router-dom'

interface LessonNavItemProps {
  lesson: PlayerLesson
  courseId: string
  isActive: boolean
  isLocked: boolean
}

export function LessonNavItem({ lesson, courseId, isActive, isLocked }: LessonNavItemProps) {
  const isCompleted = lesson.progress?.completed
  const isLoading = false // If we had transition states, we'd use useNavigation()

  // Determine the correct route prefix based on type
  let routePrefix = 'lesson'
  if (lesson.type === 'assignment') routePrefix = 'assignment'

  return (
    <Link
      to={isLocked ? '#' : `/learn/${courseId}/${routePrefix}/${lesson.id}`}
      className={cn(
        'flex items-center gap-3 py-2.5 px-4 transition-colors relative group',
        isActive ? 'bg-primary/10 border-l-2 border-primary pl-[14px]' : 'hover:bg-muted/50 border-l-2 border-transparent',
        isLocked && 'opacity-60 cursor-not-allowed hover:bg-transparent'
      )}
      onClick={(e) => isLocked && e.preventDefault()}
    >
      <LessonTypeBadge type={lesson.type} variant="icon-only" className="flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm truncate transition-colors',
          isActive ? 'font-semibold text-primary' : 'font-medium group-hover:text-foreground/80'
        )}>
          {lesson.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {lesson.duration_minutes} min
        </p>
      </div>

      <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : isLocked ? (
          <Lock className="w-4 h-4 text-muted-foreground" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500/20" />
        ) : null}
      </div>
    </Link>
  )
}
