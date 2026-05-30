import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLiveSessionStore } from '@/store/liveSessionStore'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DailyIframeWrapper } from '@/components/live/DailyIframeWrapper'
import { SessionControlBar } from '@/components/live/SessionControlBar'
import { WhiteboardPanel } from '@/components/live/WhiteboardPanel'
import { PollsPanel } from '@/components/live/PollsPanel'
import { QAQueuePanel } from '@/components/live/QAQueuePanel'
import { Loader2 } from 'lucide-react'
import type { LiveSession } from '@/lib/types'

export default function InstructorLiveRoomPage() {
  const { courseId, sessionId } = useParams<{ courseId: string; sessionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setSession, setActivePoll, reset } = useLiveSessionStore()
  const [sessionData, setSessionData] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [recording, setRecording] = useState(false)
  const [attendeeCount] = useState(0)
  const [roomUrl, setRoomUrl] = useState<string | null>(null)

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
    setSession(session.id, true)

    if (!session.daily_room_url) {
      const roomUrl = `https://eduflow.daily.co/${sessionId}`
      await supabase
        .from('live_sessions')
        .update({ daily_room_url: roomUrl })
        .eq('id', sessionId)
      setRoomUrl(roomUrl)
    } else {
      setRoomUrl(session.daily_room_url)
    }

    if (!session.started_at) {
      await supabase
        .from('live_sessions')
        .update({ started_at: new Date().toISOString() })
        .eq('id', sessionId)
    }

    setLoading(false)
  }, [sessionId, navigate, setSession])

  useEffect(() => {
    fetchSession()
    return () => { reset() }
  }, [fetchSession, reset])

  const handleEndSession = async () => {
    if (!sessionId) return
    await supabase
      .from('live_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
    toast.success('Session ended')
    navigate(`/instructor/courses/${courseId}/live`)
  }

  if (loading || !sessionData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-4">
            <DailyIframeWrapper url={roomUrl ?? undefined} isOwner userName={user?.full_name} />
          </div>
        </div>

        <div className="w-80 border-l bg-background">
          <Tabs defaultValue="whiteboard" className="flex h-full flex-col">
            <TabsList className="mx-3 mt-3">
              <TabsTrigger value="whiteboard" className="flex-1">Whiteboard</TabsTrigger>
              <TabsTrigger value="polls" className="flex-1">Polls</TabsTrigger>
              <TabsTrigger value="qa" className="flex-1">Q&A</TabsTrigger>
            </TabsList>

            <TabsContent value="whiteboard" className="flex-1 overflow-y-auto p-3">
              <WhiteboardPanel isHost />
            </TabsContent>

            <TabsContent value="polls" className="flex-1 overflow-y-auto p-3">
              <PollsPanel sessionId={sessionId!} />
            </TabsContent>

            <TabsContent value="qa" className="flex-1 overflow-y-auto p-3">
              <QAQueuePanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <SessionControlBar
        isHost
        onEndSession={handleEndSession}
        recording={recording}
        attendeeCount={attendeeCount}
      />
    </div>
  )
}
