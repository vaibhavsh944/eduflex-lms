import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLiveSessionStore } from '@/store/liveSessionStore'
import { toast } from 'sonner'
import { DailyIframeWrapper } from '@/components/live/DailyIframeWrapper'
import { SessionControlBar } from '@/components/live/SessionControlBar'
import { RaiseHandButton } from '@/components/live/RaiseHandButton'
import { PollModal } from '@/components/live/PollModal'
import { Loader2 } from 'lucide-react'
import type { LiveSession, LivePoll } from '@/lib/types'

export default function StudentLiveRoomPage() {
  const { courseId, sessionId } = useParams<{ courseId: string; sessionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setSession, activePoll, setActivePoll, reset } = useLiveSessionStore()
  const [sessionData, setSessionData] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [attendeeCount] = useState(0)

  const fetchSession = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error || !data) {
      toast.error('Session not found')
      navigate('..')
      return
    }

    const session = data as LiveSession
    setSessionData(session)
    setSession(session.id, false)
    setLoading(false)
  }, [sessionId, navigate, setSession])

  useEffect(() => {
    fetchSession()
    return () => { reset() }
  }, [fetchSession, reset])

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`live-polls-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_polls',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const poll = payload.new as LivePoll
          if (poll.is_active) {
            setActivePoll(poll)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, setActivePoll])

  const handleLeaveSession = () => {
    navigate(`/learn/${courseId}/live`)
  }

  if (loading || !sessionData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (sessionData.ended_at) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">This session has ended.</p>
        <p className="text-sm text-muted-foreground">
          The recording may be available soon.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{sessionData.name}</h1>
            <p className="text-sm text-muted-foreground">
              {sessionData.description}
            </p>
          </div>
          <RaiseHandButton />
        </div>

        <div className="flex-1">
          <DailyIframeWrapper url={sessionData.daily_room_url ?? undefined} userName={user?.full_name} />
        </div>
      </div>

      <SessionControlBar
        isHost={false}
        onLeaveSession={handleLeaveSession}
        recording={false}
        attendeeCount={attendeeCount}
      />

      {activePoll && (
        <PollModal
          poll={activePoll}
          sessionId={sessionId!}
          onClose={() => setActivePoll(null)}
        />
      )}
    </div>
  )
}
