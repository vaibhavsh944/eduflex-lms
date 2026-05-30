import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AiTutorButtonProps {
  onClick: () => void
  className?: string
}

export function AiTutorButton({ onClick, className }: AiTutorButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 animate-pulse-dot',
        className,
      )}
      aria-label="Open AI Tutor"
    >
      <Sparkles className="h-6 w-6 text-white" />
    </button>
  )
}
