import { useLiveSessionStore } from '@/store/liveSessionStore'
import { useHandRaiseChannel } from '@/hooks/live/useHandRaiseChannel'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Phone, Trash2, Clock, Hand } from 'lucide-react'

export function QAQueuePanel() {
  useHandRaiseChannel()
  const { handRaiseQueue, removeHandRaise, clearQueue } = useLiveSessionStore()

  if (handRaiseQueue.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <Hand className="h-10 w-10" />
        <div>
          <p className="text-sm font-medium">No raised hands</p>
          <p className="text-xs">Students can raise their hand to ask a question.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="gap-1">
          <Hand className="h-3 w-3" />
          {handRaiseQueue.length} hand{handRaiseQueue.length !== 1 ? 's' : ''} raised
        </Badge>
        <Button variant="ghost" size="sm" onClick={clearQueue}>
          <Trash2 className="mr-1 h-3 w-3" />
          Clear All
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {handRaiseQueue.map((item) => (
          <div
            key={item.user_id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {item.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{item.display_name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatTimeAgo(item.raised_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="sm"
                onClick={() => removeHandRaise(item.user_id)}
              >
                <Phone className="mr-1 h-3 w-3" />
                Call On
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}h ago`
}
