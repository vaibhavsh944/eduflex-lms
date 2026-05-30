import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AiProcessingStatus } from '@/lib/types'

interface AIProcessingBadgeProps {
  status: AiProcessingStatus
  label: string
}

export function AIProcessingBadge({ status, label }: AIProcessingBadgeProps) {
  if (status === 'processing') {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        ⏳ {label}…
      </Badge>
    )
  }

  if (status === 'ready') {
    return (
      <Badge variant="secondary" className="gap-1.5 text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {label} ready
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="gap-1.5">
      <AlertCircle className="h-3.5 w-3.5" />
      {label} failed
    </Badge>
  )
}
