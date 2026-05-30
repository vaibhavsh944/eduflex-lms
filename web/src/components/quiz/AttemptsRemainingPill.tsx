import React from 'react'
import { cn } from '@/lib/utils'

interface AttemptsRemainingPillProps {
  used: number
  max: number | null
}

export function AttemptsRemainingPill({ used, max }: AttemptsRemainingPillProps) {
  if (max === null) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Unlimited attempts
      </span>
    )
  }

  const remaining = max - used
  const isLow = remaining <= 1
  const isExhausted = remaining <= 0

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isExhausted && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        isLow && !isExhausted && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        !isLow && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      )}
    >
      {isExhausted
        ? 'Attempts exhausted'
        : `${remaining} of ${max} ${remaining === 1 ? 'attempt' : 'attempts'} remaining`
      }
    </span>
  )
}
