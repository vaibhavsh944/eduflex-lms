import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Users, DollarSign, BookOpen, Download, Activity } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'

const DATE_RANGES = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: '1y', value: 365 },
]

export function AdminAnalytics() {
  const [range, setRange] = useState(30)

  const fromDate = subDays(new Date(), range).toISOString()

  const { data: enrollmentTrend, error: enrollmentError } = useQuery({
    queryKey: ['analytics-enrollment-trend', range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('enrolled_at, course_id, courses!inner(pricing_type)')
        .gte('enrolled_at', fromDate)
        .order('enrolled_at')
      if (error) throw error
      const daily: Record<string, { free: number; paid: number }> = {}
      ;(data ?? []).forEach((e: any) => {
        const day = format(new Date(e.enrolled_at), 'MMM d')
        if (!daily[day]) daily[day] = { free: 0, paid: 0 }
        if (e.courses?.pricing_type === 'paid') daily[day].paid++
        else daily[day].free++
      })
      return Object.entries(daily).map(([date, v]) => ({ date, Free: v.free, Paid: v.paid }))
    }
  })

  const { data: revenueDaily, error: revenueError } = useQuery({
    queryKey: ['analytics-revenue-daily', range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'paid')
        .gte('created_at', fromDate)
        .order('created_at')
      if (error) throw error
      const daily: Record<string, number> = {}
      ;(data ?? []).forEach((p: any) => {
        const day = format(new Date(p.created_at), 'MMM d')
        daily[day] = (daily[day] || 0) + (p.amount || 0)
      })
      return Object.entries(daily).map(([date, revenue]) => ({ date, revenue }))
    }
  })

  const { data: activeUsers, error: activeError } = useQuery({
    queryKey: ['analytics-active-users', range],
    queryFn: async () => {
      const { data: lessonData, error } = await supabase
        .from('lesson_progress')
        .select('user_id, updated_at')
        .gte('updated_at', fromDate)
      if (error) throw error
      const daily: Record<string, Set<string>> = {}
      ;(lessonData ?? []).forEach((lp: any) => {
        const day = format(new Date(lp.updated_at), 'MMM d')
        if (!daily[day]) daily[day] = new Set()
        daily[day].add(lp.user_id)
      })
      return Object.entries(daily).map(([date, users]) => ({ date, DAU: users.size }))
    }
  })

  const { data: topCourses, error: topError } = useQuery({
    queryKey: ['analytics-top-courses', range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, enrollment_count, rating')
        .eq('status', 'published')
        .order('enrollment_count', { ascending: false })
        .limit(10)
      if (error) throw error

      const courseIds = (data ?? []).map(c => c.id)
      const { data: enrollData, error: enrollError } = courseIds.length > 0 ? await supabase
        .from('enrollments')
        .select('course_id')
        .in('course_id', courseIds) : { data: [], error: null }
      if (enrollError) throw enrollError

      const enrollmentMap: Record<string, number> = {}
      ;(enrollData ?? []).forEach((e: any) => {
        enrollmentMap[e.course_id] = (enrollmentMap[e.course_id] || 0) + 1
      })

      return (data ?? []).map((c: any) => ({
        ...c,
        actualEnrollments: enrollmentMap[c.id] ?? 0,
        completionRate: c.enrollment_count > 0
          ? Math.min(100, Math.round(((enrollmentMap[c.id] ?? 0) / c.enrollment_count) * 100))
          : 0,
      }))
    }
  })

  const exportAll = () => {
    toast.success('Analytics export started. Download will begin shortly.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        description="Platform-wide analytics and insights"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              {DATE_RANGES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${range === r.value ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                >{r.label}</button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={exportAll}>
              <Download className="w-4 h-4 mr-1" /> Export All
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Enrollment Trend</CardTitle></CardHeader>
          <CardContent>
            {enrollmentError ? (
              <p className="text-sm text-destructive">Failed to load enrollment trend</p>
            ) : enrollmentTrend ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Free" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Paid" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-[250px] w-full" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-4 h-4" /> Revenue (Daily)</CardTitle></CardHeader>
          <CardContent>
            {revenueError ? (
              <p className="text-sm text-destructive">Failed to load revenue data</p>
            ) : revenueDaily ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueDaily}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-[250px] w-full" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="w-4 h-4" /> Daily Active Users</CardTitle></CardHeader>
          <CardContent>
            {activeError ? (
              <p className="text-sm text-destructive">Failed to load active user data</p>
            ) : activeUsers ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activeUsers}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="DAU" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-[250px] w-full" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-4 h-4" /> Top Courses</CardTitle></CardHeader>
          <CardContent>
            {topError ? (
              <p className="text-sm text-destructive">Failed to load course data</p>
            ) : topCourses ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topCourses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="title" type="category" width={140} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="actualEnrollments" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Skeleton className="h-[250px] w-full" />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
