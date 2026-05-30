import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useLiveSessionStore } from '@/store/liveSessionStore'
import { useAuthStore } from '@/store/authStore'

export function useHandRaiseChannel() {
  const sessionId = useLiveSessionStore((s) => s.sessionId)
  const user = useAuthStore((s) => s.user)
  const addHandRaise = useLiveSessionStore((s) => s.addHandRaise)
  const removeHandRaise = useLiveSessionStore((s) => s.removeHandRaise)

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase.channel(`live-handraises-${sessionId}`, {
      config: { broadcast: { self: true } },
    })

    channel.on(
      'broadcast',
      { event: 'hand-raise' },
      (payload) => {
        const { user_id, action, display_name, raised_at } = payload.payload as {
          user_id: string
          action: 'raise' | 'lower'
          display_name: string
          raised_at: string
        }
        if (action === 'raise') {
          addHandRaise({ user_id, display_name, raised_at })
        } else {
          removeHandRaise(user_id)
        }
      }
    )

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, addHandRaise, removeHandRaise])

  const broadcast = useCallback(
    (action: 'raise' | 'lower') => {
      if (!sessionId || !user) return
      supabase.channel(`live-handraises-${sessionId}`).send({
        type: 'broadcast',
        event: 'hand-raise',
        payload: {
          user_id: user.id,
          display_name: user.full_name,
          action,
          raised_at: new Date().toISOString(),
        },
      })
    },
    [sessionId, user]
  )

  return { broadcast }
}
