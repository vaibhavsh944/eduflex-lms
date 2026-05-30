import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface CaptionStatusBadgeProps {
  status: 'processing' | 'ready' | 'error'
}

export function CaptionStatusBadge({ status }: CaptionStatusBadgeProps) {
  if (status === 'processing') {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        ⏳ Captions generating…
      </Badge>
    )
  }

  if (status === 'ready') {
    return (
      <Badge variant="secondary" className="gap-1.5 text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Captions ready
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="gap-1.5">
      <AlertCircle className="h-3.5 w-3.5" />
      Captions failed
    </Badge>
  )
}
