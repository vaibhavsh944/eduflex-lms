import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Download, FileText, TrendingUp, Users, BookOpen, DollarSign, Brain, Target } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export function AdminReports() {
  const [activeTab, setActiveTab] = useState('enrollment')

  const { data: enrollmentReport, error: enrollmentError } = useQuery({
    queryKey: ['report-enrollment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('enrollments').select('id, user_id, course_id, enrolled_at, courses(title)').order('enrolled_at', { ascending: false }).limit(500)
      if (error) throw error
      return data ?? []
    }
  })

  const { data: revenueReport, error: revenueError } = useQuery({
    queryKey: ['report-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase.from('payments').select('id, user_id, amount, status, created_at, course_id, courses(title)').order('created_at', { ascending: false }).limit(500)
      if (error) throw error
      return data ?? []
    }
  })

  const { data: userReport, error: userError } = useQuery({
    queryKey: ['report-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, email, role, status, created_at').order('created_at', { ascending: false }).limit(500)
      if (error) throw error
      return data ?? []
    }
  })

  const { data: quizReport, error: quizError } = useQuery({
    queryKey: ['report-quiz'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('id, score, passed, created_at, quiz:quizzes(title, course_id), course:courses(title)')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return data ?? []
    }
  })

  const { data: completionReport, error: completionError } = useQuery({
    queryKey: ['report-completion'],
    queryFn: async () => {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, enrollment_count')
        .eq('status', 'published')
        .limit(500)
      if (coursesError) throw coursesError
      const courseIds = (courses ?? []).map(c => c.id)
      if (courseIds.length === 0) return []

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, course_id')
        .in('course_id', courseIds)
      if (lessonsError) throw lessonsError

      const lessonCountMap: Record<string, number> = {}
      ;(lessons ?? []).forEach((l: any) => {
        lessonCountMap[l.course_id] = (lessonCountMap[l.course_id] || 0) + 1
      })

      const { data: lpData, error: lpError } = await supabase
        .from('lesson_progress')
        .select('user_id, course_id, completed')
        .in('course_id', courseIds)
      if (lpError) throw lpError

      type ProgressKey = string
      const completedMap = new Map<ProgressKey, number>()
      ;(lpData ?? []).forEach((lp: any) => {
        if (lp.completed) {
          const key = `${lp.user_id}|${lp.course_id}`
          completedMap.set(key, (completedMap.get(key) ?? 0) + 1)
        }
      })

      const userCompletedCount = new Map<string, Set<string>>()
      ;(lpData ?? []).forEach((lp: any) => {
        if (!userCompletedCount.has(lp.course_id)) userCompletedCount.set(lp.course_id, new Set())
        userCompletedCount.get(lp.course_id)!.add(lp.user_id)
      })

      return (courses ?? []).map(c => {
        const totalLessons = lessonCountMap[c.id] ?? 0
        const userSet = userCompletedCount.get(c.id)
        const totalUsers = userSet?.size ?? 0
        let completedUsers = 0
        let sumCompletion = 0

        if (userSet && totalLessons > 0) {
          userSet.forEach((uid) => {
            const key = `${uid}|${c.id}`
            const done = completedMap.get(key) ?? 0
            const pct = Math.round((done / totalLessons) * 100)
            sumCompletion += pct
            if (pct >= 100) completedUsers++
          })
        }

        return {
          course_title: c.title,
          total_enrollments: c.enrollment_count || 0,
          avg_completion_rate: totalUsers > 0 ? Math.round(sumCompletion / totalUsers) : 0,
          completed_count: completedUsers,
        }
      })
    }
  })

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) { toast.error('No data to export'); return }
    const headers = Object.keys(data[0])
    const csv = [headers.join(','), ...data.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filename} exported`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export platform reports" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="enrollment"><Users className="w-4 h-4 mr-1" /> Enrollments</TabsTrigger>
          <TabsTrigger value="revenue"><DollarSign className="w-4 h-4 mr-1" /> Revenue</TabsTrigger>
          <TabsTrigger value="users"><FileText className="w-4 h-4 mr-1" /> Users</TabsTrigger>
          <TabsTrigger value="quiz"><Brain className="w-4 h-4 mr-1" /> Quiz Performance</TabsTrigger>
          <TabsTrigger value="completion"><Target className="w-4 h-4 mr-1" /> Completion Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Enrollment Report</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(enrollmentReport || [], 'enrollments')}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>User</TableHead><TableHead>Course</TableHead><TableHead>Enrolled</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentError ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-destructive">Failed to load enrollment data</TableCell></TableRow>
                  ) : (enrollmentReport ?? []).slice(0, 100).map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.user_id?.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm">{e.courses?.title || '—'}</TableCell>
                      <TableCell className="text-xs">{format(new Date(e.enrolled_at), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                  {(!enrollmentReport || enrollmentReport.length === 0) && !enrollmentError && (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No enrollment data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Revenue Report</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(revenueReport || [], 'revenue')}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Order</TableHead><TableHead>Course</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {revenueError ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-destructive">Failed to load revenue data</TableCell></TableRow>
                  ) : (revenueReport ?? []).slice(0, 100).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id?.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm">{p.courses?.title || '—'}</TableCell>
                      <TableCell>₹{(p.amount || 0).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={p.status === 'paid' ? 'default' : 'outline'}>{p.status}</Badge></TableCell>
                      <TableCell className="text-xs">{format(new Date(p.created_at), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                  {(!revenueReport || revenueReport.length === 0) && !revenueError && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No revenue data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">User Report</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(userReport || [], 'users')}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {userError ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-destructive">Failed to load user data</TableCell></TableRow>
                  ) : (userReport ?? []).slice(0, 100).map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-sm font-medium">{u.full_name}</TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell><Badge variant={u.role === 'admin' ? 'default' : u.role === 'instructor' ? 'secondary' : 'outline'}>{u.role}</Badge></TableCell>
                      <TableCell><Badge variant={u.status === 'active' ? 'default' : 'destructive'}>{u.status === 'active' ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell className="text-xs">{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                  {(!userReport || userReport.length === 0) && !userError && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No user data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Quiz Performance Report</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(quizReport || [], 'quiz-performance')}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Quiz</TableHead><TableHead>Course</TableHead><TableHead>Score</TableHead><TableHead>Passed</TableHead><TableHead>Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {quizError ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-destructive">Failed to load quiz data</TableCell></TableRow>
                  ) : (quizReport ?? []).slice(0, 100).map((q: any) => (
                    <TableRow key={q.id}>
                      <TableCell className="text-sm">{q.quiz?.title || '—'}</TableCell>
                      <TableCell className="text-sm">{q.course?.title || '—'}</TableCell>
                      <TableCell className="text-sm font-medium">{q.score ?? '—'}%</TableCell>
                      <TableCell><Badge variant={q.passed ? 'default' : 'destructive'}>{q.passed ? 'Passed' : 'Failed'}</Badge></TableCell>
                      <TableCell className="text-xs">{format(new Date(q.created_at), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                  {(!quizReport || quizReport.length === 0) && !quizError && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No quiz data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Completion Rate Report</CardTitle>
                <Button size="sm" variant="outline" onClick={() => downloadCSV(completionReport || [], 'completion-rates')}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Course</TableHead><TableHead>Enrollments</TableHead><TableHead>Avg Completion</TableHead><TableHead>Completed</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {completionError ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-destructive">Failed to load completion data</TableCell></TableRow>
                  ) : (completionReport ?? []).slice(0, 100).map((c: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{c.course_title}</TableCell>
                      <TableCell className="text-sm">{c.total_enrollments}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${c.avg_completion_rate}%` }} />
                          </div>
                          <span className="text-xs">{c.avg_completion_rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.completed_count}</TableCell>
                    </TableRow>
                  ))}
                  {(!completionReport || completionReport.length === 0) && !completionError && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No completion data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
