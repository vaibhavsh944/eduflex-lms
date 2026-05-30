import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakCounterProps {
  currentStreak: number
  longestStreak?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function StreakCounter({ currentStreak, longestStreak, size = 'md', showLabel = true }: StreakCounterProps) {
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const isActive = currentStreak > 0

  return (
    <div className={cn('flex items-center', sizeClasses[size])}>
      <Flame
        className={cn(
          iconSizes[size],
          isActive ? 'text-orange-500' : 'text-muted-foreground',
          isActive && 'animate-pulse'
        )}
      />
      <span className={cn('font-bold', isActive ? 'text-orange-600' : 'text-muted-foreground')}>
        {currentStreak}
      </span>
      {showLabel && (
        <span className="text-muted-foreground ml-1">
          {currentStreak === 1 ? 'day' : 'day streak'}
        </span>
      )}
      {longestStreak !== undefined && longestStreak > 0 && (
        <span className="text-xs text-muted-foreground ml-2">
          (Best: {longestStreak})
        </span>
      )}
    </div>
  )
}
