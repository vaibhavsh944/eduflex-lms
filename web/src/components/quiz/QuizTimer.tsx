import React, { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizTimerProps {
  startedAt: string
  timeLimitSeconds: number
  onExpire: () => void
}

export function QuizTimer({ startedAt, timeLimitSeconds, onExpire }: QuizTimerProps) {
  const [remaining, setRemaining] = useState<number>(timeLimitSeconds)

  useEffect(() => {
    const calcRemaining = () => {
      const start = new Date(startedAt).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - start) / 1000)
      return Math.max(0, timeLimitSeconds - elapsed)
    }

    setRemaining(calcRemaining())

    const timer = setInterval(() => {
      const r = calcRemaining()
      setRemaining(r)
      if (r === 0) {
        clearInterval(timer)
        onExpire()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startedAt, timeLimitSeconds, onExpire])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const isDanger = remaining < 120

  return (
    <div className={cn(
      "flex items-center space-x-2 font-mono font-bold px-3 py-1.5 rounded-md border",
      isDanger ? "text-red-500 border-red-500/50 bg-red-500/10 animate-pulse" : "text-muted-foreground border-border bg-muted/30"
    )}>
      <Clock className="w-4 h-4" />
      <span aria-live="polite" role="timer">{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}</span>
    </div>
  )
}
