import React from 'react'
import { AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GracePeriodBannerProps {
  inGracePeriod: boolean
  pastDeadline: boolean
  penaltyPct: number
}

export function GracePeriodBanner({ inGracePeriod, pastDeadline, penaltyPct }: GracePeriodBannerProps) {
  if (pastDeadline) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
        <Clock className="w-5 h-5 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            The submission window for this quiz has closed.
          </p>
        </div>
      </div>
    )
  }

  if (inGracePeriod) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            You are in the grace period. A {penaltyPct}% penalty will apply to your score.
          </p>
        </div>
      </div>
    )
  }

  return null
}
