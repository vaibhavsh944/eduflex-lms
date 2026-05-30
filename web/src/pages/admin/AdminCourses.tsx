import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Link } from 'react-router-dom'
import { Search, Eye, CheckCircle2, XCircle, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function AdminCourses() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses', statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select('*, profiles!instructor_id(full_name, avatar_url)')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)
      if (categoryFilter !== 'all') query = query.eq('category', categoryFilter)

      const { data } = await query
      return data ?? []
    }
  })

  const moderateMutation = useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: string; status: string; rejection_reason?: string }) => {
      const update: any = { status }
      if (rejection_reason) update.rejection_reason = rejection_reason
      const { error } = await supabase.from('courses').update(update).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Course updated')
      qc.invalidateQueries({ queryKey: ['admin-courses'] })
      setRejectId(null); setRejectReason(''); setDeleteId(null)
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses').update({ status: 'deleted' }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Course soft-deleted')
      qc.invalidateQueries({ queryKey: ['admin-courses'] })
      setDeleteId(null)
    },
    onError: (err) => toast.error(err.message),
  })

  const filtered = (courses || []).filter((c: any) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const statusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      published: 'default',
      draft: 'outline',
      archived: 'secondary',
      pending_review: 'default',
      rejected: 'destructive',
      deleted: 'destructive',
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Courses" description="Manage all platform courses" />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by title or instructor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v: string | null) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v: string | null) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filtered.length} courses</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((course: any) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.thumbnail_url && (
                          <img src={course.thumbnail_url} alt="" className="h-10 w-16 rounded object-cover bg-muted" />
                        )}
                        <div className="text-sm font-medium max-w-[200px] truncate">{course.title}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{course.profiles?.full_name || 'Unknown'}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{course.category}</Badge></TableCell>
                    <TableCell>{statusBadge(course.status)}</TableCell>
                    <TableCell className="text-sm">
                      {course.pricing_type === 'free' ? 'Free' : `₹${(course.price || 0).toLocaleString()}`}
                    </TableCell>
                    <TableCell className="text-sm">{course.enrollment_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link to={`/catalog/${course.id}`} target="_blank">
                          <Button size="sm" variant="ghost" className="h-8 px-2"><Eye className="w-4 h-4" /></Button>
                        </Link>
                        {course.status === 'pending_review' && (
                          <>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-green-600" onClick={() => moderateMutation.mutate({ id: course.id, status: 'published' })}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-red-600" onClick={() => setRejectId(course.id)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {course.status === 'published' && (
                          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => moderateMutation.mutate({ id: course.id, status: 'draft' })}>
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-red-600" onClick={() => setDeleteId(course.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No courses found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Course</DialogTitle><DialogDescription>Provide a reason for rejection</DialogDescription></DialogHeader>
          <div>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background p-3 text-sm"
              placeholder="Explain why this course is being rejected..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => rejectId && moderateMutation.mutate({ id: rejectId, status: 'rejected', rejection_reason: rejectReason })}>
              Reject Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Course</DialogTitle><DialogDescription>This action soft-deletes the course. Content is preserved.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
