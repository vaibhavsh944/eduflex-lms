import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, Video, Clock, ExternalLink } from 'lucide-react'
import { LIVE_STUDENT_ROOM } from '@/lib/constants'
import type { LiveSession } from '@/lib/types'

export default function StudentLiveListPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['live-sessions', courseId, 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('course_id', courseId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      return (data ?? [])
    },
    enabled: !!courseId,
  })

  const getStatusBadge = (session: LiveSession) => {
    if (session.ended_at) return <Badge variant="secondary">Ended</Badge>
    if (session.started_at) return <Badge variant="default" className="bg-green-600">Live Now</Badge>
    return <Badge variant="outline">Upcoming</Badge>
  }

  const canJoin = (session: LiveSession) => {
    if (session.ended_at) return false
    return true
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Sessions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join upcoming and ongoing live sessions for this course.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Video className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No upcoming live sessions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back later for scheduled live sessions.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{session.name}</CardTitle>
                  {getStatusBadge(session)}
                </div>
                <CardDescription>
                  {session.description ?? 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{format(new Date(session.scheduled_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(session.scheduled_at), 'h:mm a')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={session.started_at ? 'default' : 'outline'}
                  disabled={!canJoin(session)}
                  onClick={() => navigate(LIVE_STUDENT_ROOM(courseId!, session.id))}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {session.started_at ? 'Join Now' : 'View Session'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
