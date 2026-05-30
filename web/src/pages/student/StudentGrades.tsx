import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { EmptyState } from '@/components/common/EmptyState'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useEnrolledCourses } from '@/hooks/queries/useEnrolledCourses'
import { BookOpen, FileQuestion } from 'lucide-react'

export function StudentGrades() {
  const user = useAuthStore((s) => s.user)
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const { data: enrollments } = useEnrolledCourses('completed')

  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user!.id)
        .order('graded_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })

  const filtered = (grades ?? []).filter(g => {
    if (courseFilter !== 'all' && g.course_id !== courseFilter) return false
    if (typeFilter !== 'all' && g.item_type !== typeFilter) return false
    return true
  })

  const getBadgeVariant = (grade: { percentage: number; letter_grade?: string }) => {
    const pct = grade.percentage
    if (pct >= 90) return 'default'
    if (pct >= 80) return 'secondary'
    if (pct >= 70) return 'outline'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Grades" description="View your grades and performance" />

      <div className="flex flex-wrap gap-3">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Courses</option>
          {enrollments?.map((e: any) => (
            <option key={e.course_id} value={e.course_id}>
              {e.course?.title}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Types</option>
          <option value="quiz">Quizzes</option>
          <option value="course">Courses</option>
          <option value="assignment">Assignments</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <SkeletonTable rows={5} cols={4} />
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No grades found"
                description={grades?.length === 0 ? 'No grades recorded yet.' : 'No grades match your filters.'}
                icon={<BookOpen className="h-8 w-8" />}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold text-muted-foreground">Item</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Type</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Score</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Percentage</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Grade</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((grade) => (
                    <tr key={grade.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{grade.item_title}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-muted-foreground capitalize">
                          {grade.item_type === 'quiz' ? <FileQuestion className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                          {grade.item_type}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono">{grade.score}/{grade.max_score}</td>
                      <td className="p-4 text-right font-mono">{grade.percentage}%</td>
                      <td className="p-4 text-right">
                        <Badge variant={getBadgeVariant(grade)}>
                          {grade.letter_grade ?? '-'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {new Date(grade.graded_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
