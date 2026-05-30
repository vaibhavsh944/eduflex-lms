import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  color?: string
  size?: 'sm' | 'md'
  className?: string
}

export function ProgressBar({ value, color, size = 'md', className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out')}
        style={{
          width: `${clamped}%`,
          backgroundColor: color || 'hsl(var(--primary))',
        }}
      />
    </div>
  )
}
