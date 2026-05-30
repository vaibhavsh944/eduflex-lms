import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Plus, Send, Clock, CheckCircle2, Megaphone } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

type AnnouncementStatus = 'draft' | 'scheduled' | 'sent'
type TargetType = 'all' | 'role' | 'course'

export function AdminAnnouncements() {
  const qc = useQueryClient()
  const [showComposer, setShowComposer] = useState(false)
  const [title, setTitle] = useState('')
  const [targetType, setTargetType] = useState<TargetType>('all')
  const [targetRole, setTargetRole] = useState('student')
  const [targetCourseId, setTargetCourseId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [sendPush, setSendPush] = useState(false)
  const [sendEmail, setSendEmail] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const { data: announcements } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
      return data ?? []
    }
  })

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-list'],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('id, title').eq('status', 'published')
      return data ?? []
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your announcement...' }),
    ],
    editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2' } },
  })

  const getBodyHtml = useCallback(() => {
    return editor?.getHTML() || '';
  }, [editor]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const bodyHtml = getBodyHtml();
      if (!title.trim() || !bodyHtml.trim() || bodyHtml === '<p></p>') throw new Error('Title and body are required')
      const payload: any = {
        title: title.trim(),
        body: getBodyHtml(),
        target_type: targetType,
        target_role: targetType === 'role' ? targetRole : null,
        target_course_id: targetType === 'course' ? targetCourseId : null,
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduled_at: scheduledAt || null,
        send_push: sendPush,
        send_email: sendEmail,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      }
      if (editId) {
        const { error } = await supabase.from('announcements').update(payload).eq('id', editId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('announcements').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast.success(editId ? 'Announcement updated' : 'Announcement saved')
      resetForm()
      qc.invalidateQueries({ queryKey: ['admin-announcements'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.functions.invoke('admin-send-announcement', { body: { announcement_id: id } })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Announcement sent!')
      qc.invalidateQueries({ queryKey: ['admin-announcements'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const resetForm = () => {
    setShowComposer(false)
    setEditId(null)
    setTitle('')
    editor?.commands.setContent('')
    setTargetType('all')
    setTargetRole('student')
    setTargetCourseId('')
    setScheduledAt('')
    setSendPush(false)
    setSendEmail(false)
  }

  const openEdit = (a: any) => {
    setEditId(a.id)
    setTitle(a.title)
    editor?.commands.setContent(a.body || '')
    setTargetType(a.target_type)
    setTargetRole(a.target_role || 'student')
    setTargetCourseId(a.target_course_id || '')
    setScheduledAt(a.scheduled_at || '')
    setSendPush(a.send_push || false)
    setSendEmail(a.send_email || false)
    setShowComposer(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Create and manage platform-wide announcements"
        actions={<Button onClick={() => { resetForm(); setShowComposer(true) }}><Plus className="w-4 h-4 mr-1" /> New Announcement</Button>}
      />

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Megaphone className="w-4 h-4" /> All Announcements</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Title</TableHead><TableHead>Target</TableHead><TableHead>Status</TableHead><TableHead>Scheduled</TableHead><TableHead>Sent</TableHead><TableHead>Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {(announcements || []).map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {a.target_type === 'all' ? 'All Users' : a.target_type === 'role' ? `Role: ${a.target_role}` : 'Specific Course'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.status === 'sent' ? 'default' : a.status === 'scheduled' ? 'secondary' : 'outline'}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{a.scheduled_at ? format(new Date(a.scheduled_at), 'MMM d, HH:mm') : '—'}</TableCell>
                  <TableCell className="text-sm">{a.sent_at ? format(new Date(a.sent_at), 'MMM d, HH:mm') : '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(a)}>Edit</Button>
                      {a.status === 'draft' && (
                        <Button size="sm" variant="default" onClick={() => sendMutation.mutate(a.id)} disabled={sendMutation.isPending}>
                          <Send className="w-3 h-3 mr-1" /> Send
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!announcements || announcements.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No announcements yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showComposer} onOpenChange={setShowComposer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editId ? 'Edit Announcement' : 'New Announcement'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" />
            </div>
            <div>
              <Label>Body</Label>
              <div className="border rounded-md">
                <EditorContent editor={editor} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Audience</Label>
                <Select value={targetType} onValueChange={(v: string | null) => v && setTargetType(v as TargetType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="role">Specific Role</SelectItem>
                    <SelectItem value="course">Specific Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {targetType === 'role' && (
                <div>
                  <Label>Role</Label>
                  <Select value={targetRole} onValueChange={(v: string | null) => v && setTargetRole(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="instructor">Instructors</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {targetType === 'course' && (
                <div>
                  <Label>Course</Label>
                  <Select value={targetCourseId} onValueChange={(v: string | null) => v && setTargetCourseId(v)}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {(courses || []).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={sendPush} onCheckedChange={setSendPush} id="push" />
                <Label htmlFor="push">Push notification</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={sendEmail} onCheckedChange={setSendEmail} id="email" />
                <Label htmlFor="email">Send email</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposer(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {editId ? 'Update' : scheduledAt ? 'Schedule' : 'Save as Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
