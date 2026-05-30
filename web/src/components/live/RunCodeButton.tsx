import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Play } from 'lucide-react'

interface RunCodeButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
}

export function RunCodeButton({ onClick, isLoading, disabled }: RunCodeButtonProps) {
  const [lastRun, setLastRun] = useState(0)
  const COOLDOWN_MS = 5000

  const handleClick = () => {
    const now = Date.now()
    if (now - lastRun < COOLDOWN_MS) return
    setLastRun(now)
    onClick()
  }

  const isOnCooldown = Date.now() - lastRun < COOLDOWN_MS

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading || isOnCooldown}
      size="sm"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
      ) : (
        <Play className="w-4 h-4 mr-1.5" />
      )}
      {isLoading ? 'Running...' : isOnCooldown ? 'Wait...' : 'Run Code'}
    </Button>
  )
}
