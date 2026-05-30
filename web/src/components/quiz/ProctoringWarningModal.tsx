import React, { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProctoringWarningModalProps {
  warningCount: number
  maxWarnings: number
  onAcknowledge: () => void
}

export function ProctoringWarningModal({
  warningCount,
  maxWarnings,
  onAcknowledge
}: ProctoringWarningModalProps) {
  const [canAcknowledge, setCanAcknowledge] = useState(false)
  const remaining = maxWarnings - warningCount

  useEffect(() => {
    setCanAcknowledge(false)
    const timer = setTimeout(() => setCanAcknowledge(true), 3000)
    return () => clearTimeout(timer)
  }, [warningCount])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-background rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border border-red-200 dark:border-red-900 text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
          Tab Switch Detected
        </h2>
        <p className="text-muted-foreground">
          Warning {warningCount} of {maxWarnings}. After {maxWarnings} warnings, your quiz will be auto-submitted for instructor review.
        </p>
        <p className="text-lg font-semibold">
          Remaining warnings: {remaining}
        </p>
        <Button
          onClick={onAcknowledge}
          disabled={!canAcknowledge}
          variant={canAcknowledge ? "default" : "outline"}
          className="min-w-[200px]"
        >
          {canAcknowledge ? 'Continue Quiz' : `Wait ${Math.ceil(3 - (warningCount > 0 ? 0 : 0))}s...`}
        </Button>
      </div>
    </div>
  )
}
