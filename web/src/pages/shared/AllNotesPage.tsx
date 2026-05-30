import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { StudentNote } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { format } from 'date-fns'
import { FileText, Download, Search, BookOpen, Users } from 'lucide-react'

export function AllNotesPage() {
  const user = useAuthStore((s) => s.user)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: privateNotes, isLoading: privateLoading, error: privateError } = useQuery({
    queryKey: ['all-private-notes', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('student_notes')
          .select('*, course:courses(title)')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false })
        if (error) throw error
        return data ?? []
      } catch {
        return []
      }
    },
    enabled: !!user,
  })

  const { data: classNotes, isLoading: classNotesLoading } = useQuery({
    queryKey: ['all-class-notes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collab_notes')
        .select('*, lesson:lessons(title), course:courses(title)')
        .eq('last_updated_by', user!.id)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data as any[]
    },
    enabled: !!user,
  })

  const { data: groupDocs, isLoading: groupDocsLoading } = useQuery({
    queryKey: ['all-group-docs', user?.id],
    queryFn: async () => {
      const { data: memberships, error: mErr } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user!.id)
      if (mErr) throw mErr
      const groupIds = memberships.map((m) => m.group_id)
      if (groupIds.length === 0) return []
      const { data, error } = await supabase
        .from('study_group_doc')
        .select('*, study_group:study_groups!group_id(name, course_id)')
        .in('group_id', groupIds)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data as any[]
    },
    enabled: !!user,
  })

  const exportNote = (note: StudentNote) => {
    const blob = new Blob([note.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `note-${note.id.slice(0, 8)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredPrivate = privateNotes?.filter((n) =>
    n.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
  ) ?? []

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader title="My Notes" description="All your notes and documents in one place" />

      <Tabs defaultValue="private" className="mt-6">
        <TabsList>
          <TabsTrigger value="private" className="gap-2">
            <FileText className="h-4 w-4" />
            Private Notes
          </TabsTrigger>
          <TabsTrigger value="class" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Class Notes (Contributed)
          </TabsTrigger>
          <TabsTrigger value="group" className="gap-2">
            <Users className="h-4 w-4" />
            Study Group Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="private" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {privateLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : privateError ? (
            <ErrorState title="Failed to load notes" />
          ) : filteredPrivate.length === 0 ? (
            <EmptyState title="No private notes found" description={searchQuery ? 'Try a different search' : 'Take notes while studying to see them here'} />
          ) : (
            <div className="space-y-3">
              {filteredPrivate.map((note) => (
                <Card key={note.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium truncate">
                        {(note as any).course?.title ?? 'Unknown Course'}
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => exportNote(note)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">Updated {format(new Date(note.updated_at), 'MMM d, yyyy')}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="class" className="mt-4 space-y-4">
          {classNotesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !classNotes || classNotes.length === 0 ? (
            <EmptyState title="No contributed class notes" description="Contributions to collaborative class notes will appear here" />
          ) : (
            <div className="space-y-3">
              {classNotes.map((note: any) => (
                <Card key={note.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{note.lesson?.title ?? 'Unknown Lesson'}</p>
                        <p className="text-xs text-muted-foreground">{note.course?.title ?? 'Unknown Course'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Updated {format(new Date(note.updated_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="group" className="mt-4 space-y-4">
          {groupDocsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !groupDocs || groupDocs.length === 0 ? (
            <EmptyState title="No study group docs" description="Documents shared in your study groups will appear here" />
          ) : (
            <div className="space-y-3">
              {groupDocs.map((doc: any) => (
                <Card key={doc.group_id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{doc.study_group?.name ?? 'Unknown Group'}</p>
                        <p className="text-xs text-muted-foreground">Course document</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Updated {format(new Date(doc.updated_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
