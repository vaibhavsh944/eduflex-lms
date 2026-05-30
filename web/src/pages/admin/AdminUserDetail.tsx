import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Mail, Calendar, Shield, Activity, BookOpen, UserCheck, CreditCard, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

export function AdminUserDetail() {
  const { id } = useParams()
  const [impersonating, setImpersonating] = useState(() => !!sessionStorage.getItem('ef-admin-token'))

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
      return data as any
    },
    enabled: !!id,
  })

  const { data: enrollments } = useQuery({
    queryKey: ['admin-user-enrollments', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('id, status, progress, enrolled_at, completed_at, courses(title, thumbnail_url)')
        .eq('user_id', id)
        .order('enrolled_at', { ascending: false })
      return data ?? []
    },
    enabled: !!id,
  })

  const { data: recentActivity } = useQuery({
    queryKey: ['admin-user-activity', id],
    queryFn: async () => {
      const [quizRes, lessonRes] = await Promise.all([
        supabase.from('quiz_attempts').select('id, score, passed, submitted_at, course_id').eq('user_id', id).order('submitted_at', { ascending: false }).limit(10),
        supabase.from('lesson_progress').select('id, completed, completed_at, lesson_id').eq('user_id', id).order('completed_at', { ascending: false }).limit(10),
      ])
      return {
        quizzes: quizRes.data ?? [],
        lessons: lessonRes.data ?? [],
      }
    },
    enabled: !!id,
  })

  const { data: submissions } = useQuery({
    queryKey: ['admin-user-submissions', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('submissions')
        .select('*, assignment:assignments(title, course_id, max_points)')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
    enabled: !!id,
  })

  const { data: payments } = useQuery({
    queryKey: ['admin-user-payments', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('payments')
        .select('*, course:courses(title)')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
    enabled: !!id,
  })

  const handleImpersonate = async () => {
    if (!id) return
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const currentSession = sessionData.session
      if (currentSession) {
        sessionStorage.setItem('ef-admin-token', JSON.stringify({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        }))
      }

      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { user_id: id },
      })
      if (error) throw error

      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })

      setImpersonating(true)
      toast.success(`Now viewing as ${profile?.full_name || 'user'}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to impersonate user')
    }
  }

  const handleStopImpersonating = async () => {
    try {
      const stored = sessionStorage.getItem('ef-admin-token')
      if (stored) {
        const { access_token, refresh_token } = JSON.parse(stored)
        await supabase.auth.setSession({ access_token, refresh_token })
        sessionStorage.removeItem('ef-admin-token')
      }
      setImpersonating(false)
      toast.success('Returned to admin account')
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore admin session')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Details" description="Loading..." />
        <Card><CardContent className="p-6 space-y-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </CardContent></Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Not Found" description="This user does not exist" />
        <Card><CardContent className="p-6 text-center text-muted-foreground">
          <p>User not found or has been deleted.</p>
          <Link to={ROUTES.ADMIN_USERS}><Button variant="outline" className="mt-4">Back to Users</Button></Link>
        </CardContent></Card>
      </div>
    )
  }

  const initials = profile.full_name
    ?.split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <div className="space-y-6">
      {impersonating && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            You are viewing as <strong>{profile?.full_name}</strong>
          </p>
          <Button variant="outline" size="sm" onClick={handleStopImpersonating} className="border-amber-500/50">
            Stop Impersonating
          </Button>
        </div>
      )}

      <PageHeader
        title="User Details"
        description="View and manage user profile"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImpersonate} disabled={impersonating}>
              <UserCheck className="w-4 h-4 mr-1" /> Impersonate
            </Button>
            <Link to={ROUTES.ADMIN_USERS}>
              <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Users</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <Badge variant={profile.role === 'admin' ? 'default' : profile.role === 'instructor' ? 'secondary' : 'outline'}>{profile.role}</Badge>
                <Badge variant={profile.status === 'active' ? 'default' : 'destructive'}>{profile.status === 'active' ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {profile.email}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {format(new Date(profile.created_at), 'MMM d, yyyy')}</span>
                {profile.department_id && <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {profile.department_id}</span>}
              </div>
              {profile.bio && <p className="text-sm text-muted-foreground mt-2 max-w-xl">{profile.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><Activity className="w-4 h-4 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="enrollments"><BookOpen className="w-4 h-4 mr-1" /> Enrollments ({enrollments?.length || 0})</TabsTrigger>
          <TabsTrigger value="submissions"><FileText className="w-4 h-4 mr-1" /> Submissions ({submissions?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="w-4 h-4 mr-1" /> Payments ({payments?.length || 0})</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-1" /> Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{enrollments?.length || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{enrollments?.filter((e: any) => e.status === 'completed').length || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Avg Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {enrollments?.length
                    ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / enrollments.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="p-3 font-medium">Course</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Progress</th>
                    <th className="p-3 font-medium">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {(enrollments || []).map((e: any) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="p-3 text-sm font-medium">{e.courses?.title}</td>
                      <td className="p-3"><Badge variant={e.status === 'completed' ? 'default' : 'secondary'}>{e.status}</Badge></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${e.progress}%` }} />
                          </div>
                          <span className="text-xs">{e.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs">{format(new Date(e.enrolled_at), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                  {(!enrollments || enrollments.length === 0) && (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No enrollments</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="p-3 font-medium">Assignment</th>
                    <th className="p-3 font-medium">Course</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Grade</th>
                    <th className="p-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {(submissions || []).map((s: any) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="p-3 text-sm font-medium">{s.assignment?.title}</td>
                      <td className="p-3 text-sm">Course ID: {s.assignment?.course_id?.slice(0, 8)}</td>
                      <td className="p-3"><Badge variant={s.status === 'graded' ? 'default' : 'secondary'}>{s.status}</Badge></td>
                      <td className="p-3">{s.grade != null ? `${s.grade}/${s.assignment?.max_points || 100}` : '—'}</td>
                      <td className="p-3 text-xs">{format(new Date(s.created_at), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                  {(!submissions || submissions.length === 0) && (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No submissions</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="p-3 font-medium">Course</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(payments || []).map((p: any) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="p-3 text-sm font-medium">{p.course?.title}</td>
                      <td className="p-3 text-sm">₹{((p.amount || 0) / 100).toLocaleString()}</td>
                      <td className="p-3"><Badge variant={p.status === 'paid' ? 'default' : p.status === 'refunded' ? 'secondary' : 'outline'}>{p.status}</Badge></td>
                      <td className="p-3 text-xs">{format(new Date(p.created_at), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                  {(!payments || payments.length === 0) && (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No payments</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Quiz Attempts</CardTitle></CardHeader>
              <CardContent>
                {recentActivity?.quizzes?.length ? (
                  <div className="space-y-2">
                    {recentActivity.quizzes.slice(0, 5).map((q: any) => (
                      <div key={q.id} className="flex justify-between text-sm">
                        <span className={q.passed ? 'text-green-600' : 'text-red-600'}>{q.score}%</span>
                        <span className="text-xs text-muted-foreground">{q.submitted_at ? format(new Date(q.submitted_at), 'MMM d') : '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No quiz attempts</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Lessons Completed</CardTitle></CardHeader>
              <CardContent>
                {recentActivity?.lessons?.length ? (
                  <div className="space-y-2">
                    {recentActivity.lessons.slice(0, 5).map((l: any) => (
                      <div key={l.id} className="flex justify-between text-sm">
                        <span>{l.completed ? '✓' : '○'}</span>
                        <span className="text-xs text-muted-foreground">{l.completed_at ? format(new Date(l.completed_at), 'MMM d') : '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No lessons completed</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
