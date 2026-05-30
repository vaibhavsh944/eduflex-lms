import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, TrendingDown, Users, Clock } from 'lucide-react'

export function AdminDashboardExtensions() {
  const { data: atRiskData } = useQuery({
    queryKey: ['admin-at-risk'],
    queryFn: async () => {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('user_id, course_id, progress, enrolled_at, courses!inner(title), profiles!left(full_name, email)')
        .lte('progress', 30)
        .order('enrolled_at', { ascending: false })
        .limit(20)
      return (enrollments ?? []).filter((e: any) => {
        const daysSince = (Date.now() - new Date(e.enrolled_at).getTime()) / 86400000
        return daysSince >= 14
      })
    }
  })

  const { data: recentEnrollments } = useQuery({
    queryKey: ['admin-recent-enrollments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('user_id, enrolled_at, courses!inner(title), profiles!left(full_name, email)')
        .order('enrolled_at', { ascending: false })
        .limit(8)
      return data ?? []
    }
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" /> At-Risk Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {atRiskData ? (
            atRiskData.length > 0 ? (
              <div className="space-y-3">
                {atRiskData.slice(0, 8).map((e: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{e.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{e.courses?.title}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">{e.progress}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-muted-foreground">
                <TrendingDown className="w-8 h-8 mb-2" />
                <p className="text-sm">No at-risk students found</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-4 h-4" /> Recent Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEnrollments ? (
            recentEnrollments.length > 0 ? (
              <div className="space-y-3">
                {recentEnrollments.slice(0, 8).map((e: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{e.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{e.courses?.title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round((Date.now() - new Date(e.enrolled_at).getTime()) / 3600000)}h ago
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No recent enrollments</p>
            )
          ) : (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
