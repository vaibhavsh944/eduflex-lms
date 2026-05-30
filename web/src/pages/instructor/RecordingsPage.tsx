import { useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { PublishRecordingDialog } from '@/components/live/PublishRecordingDialog'
import { ExternalLink, Play, Trash2, Video, Eye } from 'lucide-react'
import type { LiveSession } from '@/lib/types'

export default function RecordingsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const queryClient = useQueryClient()
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null)

  const { data: recordings, isLoading } = useQuery({
    queryKey: ['recordings', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('course_id', courseId)
        .not('recording_url', 'is', null)
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
        .update({ recording_url: null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings', courseId] })
      toast.success('Recording removed')
    },
    onError: () => toast.error('Failed to remove recording'),
  })

  const handlePublishClick = (session: LiveSession) => {
    setSelectedSession(session)
    setPublishDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recordings"
        description="Manage session recordings and publish them as on-demand lessons."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Recordings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Recording</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-36" /></TableCell>
                  </TableRow>
                ))
              ) : !recordings || recordings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    <Video className="mx-auto h-8 w-8 mb-2" />
                    <p>No recordings found. Sessions with recordings will appear here.</p>
                  </TableCell>
                </TableRow>
              ) : (
                recordings.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.name}</TableCell>
                    <TableCell>
                      {format(new Date(session.scheduled_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      —
                    </TableCell>
                    <TableCell>
                      {session.recording_url ? (
                        <a
                          href={session.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Recording
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.recording_url ? 'default' : 'secondary'}>
                        {session.recording_url ? 'Published' : 'Archived'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublishClick(session)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePublishClick(session)}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Publish as Lesson
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

      {selectedSession && (
        <PublishRecordingDialog
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          session={selectedSession}
          onPublish={() => queryClient.invalidateQueries({ queryKey: ['recordings', courseId] })}
        />
      )}
    </div>
  )
}
