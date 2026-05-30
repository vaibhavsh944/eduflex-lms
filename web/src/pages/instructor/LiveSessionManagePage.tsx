import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LiveSessionFormSheet } from '@/components/live/LiveSessionFormSheet'
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Video,
  Users,
  ExternalLink,
} from 'lucide-react'
import {
  LIVE_INSTRUCTOR_ROOM,
} from '@/lib/constants'
import type { LiveSession } from '@/lib/types'

export default function LiveSessionManagePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null)

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['live-sessions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('course_id', courseId)
        .order('scheduled_at', { ascending: false })

      if (error) throw error
      return (data ?? [])
    },
    enabled: !!courseId,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('live_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-sessions', courseId] })
      toast.success('Session deleted')
    },
    onError: () => toast.error('Failed to delete session'),
  })

  const getStatusBadge = (session: LiveSession) => {
    if (session.ended_at) return <Badge variant="secondary">Ended</Badge>
    if (session.started_at) return <Badge variant="default" className="bg-green-600">Live</Badge>
    return <Badge variant="outline">Scheduled</Badge>
  }

  const openEdit = (session: LiveSession) => {
    setEditingSession(session)
    setSheetOpen(true)
  }

  const openCreate = () => {
    setEditingSession(null)
    setSheetOpen(true)
  }

  const handleStartSession = (session: LiveSession) => {
    if (!courseId) return
    navigate(LIVE_INSTRUCTOR_ROOM(courseId, session.id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Sessions"
        description="Schedule and manage live streaming sessions for your course."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Session
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Scheduled At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Recording</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : !sessions || sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    <Video className="mx-auto h-8 w-8 mb-2" />
                    <p>No live sessions yet. Schedule your first session!</p>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.name}</TableCell>
                    <TableCell>
                      {format(new Date(session.scheduled_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>{getStatusBadge(session)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>—</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.recording_url ? (
                        <Badge variant="default" className="bg-blue-600">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not recorded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStartSession(session)}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(session)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(session.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <LiveSessionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={() => queryClient.invalidateQueries({ queryKey: ['live-sessions', courseId] })}
        editingSession={editingSession}
      />
    </div>
  )
}
