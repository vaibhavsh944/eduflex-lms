import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Users, UserPlus, UserX, Trash2 } from 'lucide-react'

export function AdminWaitlistsPage() {
  const queryClient = useQueryClient()

  const { data: waitlists } = useQuery({
    queryKey: ['waitlists'],
    queryFn: async () => {
      const { data } = await supabase
        .from('waitlists')
        .select('*, course:course_id(title, max_seats)')
        .order('joined_at', { ascending: false })
      return data ?? []
    }
  })

  const enrollAllMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data: entries } = await supabase
        .from('waitlists')
        .select('user_id')
        .eq('course_id', courseId)
        .order('position', { ascending: true })

      for (const entry of (entries || [])) {
        await supabase.from('enrollments').insert({ user_id: entry.user_id, course_id: courseId })
      }
      await supabase.from('waitlists').delete().eq('course_id', courseId)
    },
    onSuccess: () => {
      toast.success('All waitlisted students enrolled')
      queryClient.invalidateQueries({ queryKey: ['waitlists'] })
    },
    onError: (err) => toast.error(err.message)
  })

  const dismissAllMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await supabase.from('waitlists').delete().eq('course_id', courseId)
    },
    onSuccess: () => {
      toast.success('Waitlist cleared — all entries dismissed')
      queryClient.invalidateQueries({ queryKey: ['waitlists'] })
    },
    onError: (err) => toast.error(err.message)
  })

  const dismissOneMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await supabase.from('waitlists').delete().eq('id', entryId)
    },
    onSuccess: () => {
      toast.success('Entry removed from waitlist')
      queryClient.invalidateQueries({ queryKey: ['waitlists'] })
    },
    onError: (err) => toast.error(err.message)
  })

  const courseGroups = (waitlists || []).reduce((acc: Record<string, any[]>, w: any) => {
    if (!acc[w.course_id]) acc[w.course_id] = []
    acc[w.course_id].push(w)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PageHeader title="Waitlists" description="Monitor and manage course waitlists" />
      {Object.entries(courseGroups).map(([courseId, entries]) => {
        const course = entries[0].course
        return (
          <Card key={courseId}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{course?.title || courseId.slice(0, 8)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {entries.length} student{entries.length > 1 ? 's' : ''} waiting · Max: {course?.max_seats || 'Unlimited'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={() => enrollAllMutation.mutate(courseId)}>
                  <UserPlus className="w-4 h-4 mr-1" /> Enroll All
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => dismissAllMutation.mutate(courseId)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Dismiss All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>#</TableHead><TableHead>User ID</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {entries.sort((a: any, b: any) => a.position - b.position).map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">{entry.position}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-xs">{new Date(entry.joined_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => dismissOneMutation.mutate(entry.id)}>
                          <UserX className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
      {Object.keys(courseGroups).length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No active waitlists</p></CardContent></Card>
      )}
    </div>
  )
}
