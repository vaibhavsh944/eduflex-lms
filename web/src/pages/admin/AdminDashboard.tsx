import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Users, BookOpen, DollarSign, TrendingUp, TrendingDown, Activity, Award, UserPlus, ExternalLink, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'
import { AdminDashboardExtensions } from './AdminDashboardExtensions'

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export function AdminDashboard() {
  const { data: userCount } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
      return count ?? 0
    }
  })

  const { data: newUsersThisWeek } = useQuery({
    queryKey: ['admin-new-users-week'],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo)
      return count ?? 0
    }
  })

  const { data: totalCourses } = useQuery({
    queryKey: ['admin-total-courses'],
    queryFn: async () => {
      const { count } = await supabase.from('courses').select('id', { count: 'exact', head: true })
      return count ?? 0
    }
  })

  const { data: publishedCourses } = useQuery({
    queryKey: ['admin-published-courses'],
    queryFn: async () => {
      const { count } = await supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published')
      return count ?? 0
    }
  })

  const { data: revenueTotal } = useQuery({
    queryKey: ['admin-revenue-total'],
    queryFn: async () => {
      const { data } = await supabase.from('payments').select('amount').eq('status', 'paid')
      return (data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0)
    }
  })

  const { data: revenueThisMonth } = useQuery({
    queryKey: ['admin-revenue-month'],
    queryFn: async () => {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const { data } = await supabase.from('payments').select('amount').eq('status', 'paid').gte('created_at', monthStart.toISOString())
      return (data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0)
    }
  })

  const { data: userGrowth } = useQuery({
    queryKey: ['admin-user-growth'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
      const { data } = await supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo)
      const days: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000)
        days[d.toISOString().split('T')[0]] = 0
      }
      ;(data ?? []).forEach((p: any) => {
        const d = p.created_at.split('T')[0]
        if (d in days) days[d] += 1
      })
      return Object.entries(days).map(([date, signups]) => ({ date: date.slice(5), signups }))
    }
  })

  const { data: revenueTrend } = useQuery({
    queryKey: ['admin-revenue-trend'],
    queryFn: async () => {
      const { data } = await supabase.from('payments').select('amount, created_at').eq('status', 'paid')
      const months: Record<string, number> = {}
      const now = new Date()
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months[d.toLocaleString('default', { month: 'short' })] = 0
      }
      ;(data ?? []).forEach((p: any) => {
        const d = new Date(p.created_at)
        const key = d.toLocaleString('default', { month: 'short' })
        if (key in months) months[key] += p.amount || 0
      })
      return Object.entries(months).map(([month, revenue]) => ({ month, revenue: Math.round(revenue / 100) }))
    }
  })

  const { data: enrollmentByCategory } = useQuery({
    queryKey: ['admin-enrollment-category'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('category, enrollment_count')
        .eq('status', 'published')
      const cats: Record<string, number> = {}
      ;(data ?? []).forEach((c: any) => {
        const key = c.category || 'other'
        cats[key] = (cats[key] || 0) + (c.enrollment_count || 0)
      })
      return Object.entries(cats).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    }
  })

  const { data: topInstructors } = useQuery({
    queryKey: ['admin-top-instructors'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('instructor_id, title, enrollment_count, rating, profiles!instructor_id(full_name, avatar_url)')
        .eq('status', 'published')
        .order('enrollment_count', { ascending: false })
        .limit(10)
      return data ?? []
    }
  })

  const { data: recentAudit } = useQuery({
    queryKey: ['admin-recent-audit'],
    queryFn: async () => {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10)
      return data ?? []
    }
  })

  const StatCard = ({ icon: Icon, label, value, loading }: any) => (
    <Card>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-8 w-20" /><Skeleton className="h-4 w-32" /></div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="p-2 bg-primary/10 rounded-lg"><Icon className="w-4 h-4 text-primary" /></div>
            </div>
            <div className="text-3xl font-bold">{value}</div>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Platform overview and management" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Total Users" value={userCount?.toLocaleString() ?? '—'} loading={userCount === undefined} />
        <StatCard icon={UserPlus} label="New Users This Week" value={newUsersThisWeek?.toLocaleString() ?? '—'} loading={newUsersThisWeek === undefined} />
        <StatCard icon={BookOpen} label="Total Courses" value={totalCourses?.toLocaleString() ?? '—'} loading={totalCourses === undefined} />
        <StatCard icon={Award} label="Published" value={publishedCourses?.toLocaleString() ?? '—'} loading={publishedCourses === undefined} />
        <StatCard icon={DollarSign} label="Total Revenue" value={revenueTotal !== undefined ? `₹${(revenueTotal / 100).toLocaleString()}` : '—'} loading={revenueTotal === undefined} />
        <StatCard icon={Calendar} label="Revenue This Month" value={revenueThisMonth !== undefined ? `₹${(revenueThisMonth / 100).toLocaleString()}` : '—'} loading={revenueThisMonth === undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-4 h-4" /> User Growth (30 Days)</CardTitle></CardHeader>
          <CardContent>
            {userGrowth ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="signups" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-[250px] w-full" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-4 h-4" /> Revenue Trend (12 Months)</CardTitle></CardHeader>
          <CardContent>
            {revenueTrend ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`₹${v}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#4361ee" fill="#4361ee" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-[250px] w-full" />}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="w-4 h-4" /> Enrollment by Category</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {enrollmentByCategory && enrollmentByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={enrollmentByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {enrollmentByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-[280px] w-full" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="w-4 h-4" /> Top Instructors</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topInstructors?.slice(0, 5).map((c: any, i: number) => (
                <div key={c.instructor_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-5">#{i + 1}</span>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {c.profiles?.full_name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{c.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{c.enrollment_count}</div>
                    <div className="text-xs text-muted-foreground">students</div>
                  </div>
                </div>
              ))}
              {(!topInstructors || topInstructors.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No instructor data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAudit?.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-mono">{log.action}</Badge>
                  <span className="text-xs text-muted-foreground">{log.actor_id?.slice(0, 8)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(log.created_at)}</span>
              </div>
            ))}
            {(!recentAudit || recentAudit.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent admin actions</p>
            )}
          </div>
        </CardContent>
      </Card>

      <AdminDashboardExtensions />
    </div>
  )
}
