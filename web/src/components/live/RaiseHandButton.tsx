import { useLiveSessionStore } from '@/store/liveSessionStore'
import { useAuthStore } from '@/store/authStore'
import { useHandRaiseChannel } from '@/hooks/live/useHandRaiseChannel'
import { Button } from '@/components/ui/button'
import { Hand } from 'lucide-react'

export function RaiseHandButton() {
  const user = useAuthStore((s) => s.user)
  const sessionId = useLiveSessionStore((s) => s.sessionId)
  const addHandRaise = useLiveSessionStore((s) => s.addHandRaise)
  const removeHandRaise = useLiveSessionStore((s) => s.removeHandRaise)
  const handRaiseQueue = useLiveSessionStore((s) => s.handRaiseQueue)
  const isRaised = user ? handRaiseQueue.some((h) => h.user_id === user.id) : false
  const { broadcast } = useHandRaiseChannel()

  const toggleHand = () => {
    if (!user) return
    if (isRaised) {
      removeHandRaise(user.id)
    } else {
      addHandRaise({
        user_id: user.id,
        display_name: user.full_name,
        raised_at: new Date().toISOString(),
      })
    }
    if (sessionId) broadcast(isRaised ? 'lower' : 'raise')
  }

  return (
    <Button
      variant={isRaised ? 'destructive' : 'outline'}
      size="sm"
      onClick={toggleHand}
    >
      <Hand className={`mr-2 h-4 w-4 ${isRaised ? 'fill-current' : ''}`} />
      {isRaised ? 'Lower Hand' : 'Raise Hand'}
    </Button>
  )
}
