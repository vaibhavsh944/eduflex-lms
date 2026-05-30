import { Coins, TrendingUp, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PointsDisplayProps {
  totalPoints: number
  rank?: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function PointsDisplay({ totalPoints, rank, size = 'md', showIcon = true }: PointsDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-xl gap-2',
  }

  return (
    <div className={cn('flex items-center', sizeClasses[size])}>
      {showIcon && <Coins className="h-5 w-5 text-amber-500" />}
      <span className="font-bold text-amber-600">
        {totalPoints.toLocaleString()}
      </span>
      <span className="text-muted-foreground">pts</span>
      {rank !== undefined && (
        <span className="flex items-center gap-1 ml-2 text-sm text-muted-foreground">
          <Medal className="h-4 w-4" />
          #{rank}
        </span>
      )}
    </div>
  )
}
