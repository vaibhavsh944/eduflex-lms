import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GradeWithAIButtonProps {
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function GradeWithAIButton({ onClick, isLoading, disabled }: GradeWithAIButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analysing submission…
        </>
      ) : (
        'Grade with AI'
      )}
    </Button>
  )
}
