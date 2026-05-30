import React, { useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { ShieldCheck, Download, AlertTriangle, CheckCircle2, Send } from 'lucide-react'

export function AdminCompliancePage() {
  const { data: complianceCourses } = useQuery({
    queryKey: ['compliance-courses'],
    queryFn: async () => {
      const { data } = await supabase.from('compliance_courses').select('*, course:course_id(title, hr_email)')
      return data ?? []
    }
  })

  const { data: enrollments } = useQuery({
    queryKey: ['compliance-enrollments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('*, profile:user_id(full_name, email), course:course_id(title)')
        .in('course_id', (complianceCourses || []).map(c => c.course_id))
      return data ?? []
    },
    enabled: (complianceCourses || []).length > 0,
  })

  const stats = useMemo(() => ({
    total: enrollments?.length || 0,
    completed: enrollments?.filter((e: any) => e.completed_at)?.length || 0,
    pending: enrollments?.filter((e: any) => !e.completed_at)?.length || 0,
  }), [enrollments])

  const sendCertMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const completed = (enrollments || []).filter((e: any) => e.course_id === courseId && e.completed_at)
      for (const e of completed) {
        await supabase.functions.invoke('send-certificate', {
          body: { user_id: e.user_id, course_id: courseId }
        }).catch(() => {})
      }
    },
    onSuccess: (_, courseId) => {
      toast.success(`Certificates sent for ${courseId.slice(0, 8)}...`)
    },
    onError: (err) => toast.error(err.message)
  })

  const exportCsv = () => {
    if (!enrollments || enrollments.length === 0) {
      toast.error('No data to export')
      return
    }
    const headers = ['Course', 'Student Name', 'Email', 'Status', 'Completed At']
    const rows = enrollments.map((e: any) => [
      e.course?.title || '',
      e.profile?.full_name || '',
      e.profile?.email || '',
      e.completed_at ? 'Completed' : 'Pending',
      e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'compliance-report.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance Training" description="Track mandatory course completion for accreditation" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Required</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{stats.completed}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">{stats.pending}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Compliance Courses</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Course</TableHead><TableHead>Target Role</TableHead><TableHead>Deadline</TableHead><TableHead>Enrolled</TableHead><TableHead>Completed</TableHead><TableHead>Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {(complianceCourses || []).map((cc: any) => {
                const enrolled = (enrollments || []).filter((e: any) => e.course_id === cc.course_id)
                const completed = enrolled.filter((e: any) => e.completed_at).length
                return (
                  <TableRow key={cc.id}>
                    <TableCell className="font-medium">{cc.course?.title || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{cc.target_role}</TableCell>
                    <TableCell className="text-xs">{cc.compliance_deadline ? new Date(cc.compliance_deadline).toLocaleDateString() : 'No deadline'}</TableCell>
                    <TableCell>{enrolled.length}</TableCell>
                    <TableCell>
                      <Badge variant={completed === enrolled.length && enrolled.length > 0 ? 'default' : 'secondary'}>
                        {completed}/{enrolled.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => sendCertMutation.mutate(cc.course_id)} disabled={completed === 0 || sendCertMutation.isPending}>
                        <Send className="w-4 h-4 mr-1" /> Send Certs
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {(complianceCourses || []).length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No compliance courses configured</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
