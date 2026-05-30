import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import { formatDuration } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export function CourseOverviewPage() {
  const { courseId } = useParams();
  const user = useAuthStore(s => s.user);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-overview', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('No course ID')
      const { data: c, error } = await supabase.from('courses').select('*, instructor:profiles!instructor_id(id, full_name, avatar_url)').eq('id', courseId).single()
      if (error) throw error
      return c
    },
    enabled: !!courseId,
  })

  const { data: modules } = useQuery({
    queryKey: ['course-overview-modules', courseId],
    queryFn: async () => {
      if (!courseId) return []
      const { data: mods } = await supabase.from('modules').select('*, lessons(*)').eq('course_id', courseId).order('position')
      return mods ?? []
    },
    enabled: !!courseId,
  })

  const { data: progress } = useQuery({
    queryKey: ['course-overview-progress', courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user) return { completed: 0, total: 0 }
      const { count: total } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', courseId)
      const { data: done } = await supabase.from('lesson_progress').select('id').eq('course_id', courseId).eq('user_id', user.id).eq('completed', true)
      return { completed: done?.length ?? 0, total: total ?? 0 }
    },
    enabled: !!courseId && !!user,
  })

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-full" /><Skeleton className="h-20 w-full" /></div>
  if (!course) return <div>Course not found</div>;

  const allLessons = modules?.flatMap(m => (m as any).lessons ?? []) ?? []
  const completedCount = progress?.completed ?? 0
  const totalCount = progress?.total ?? allLessons.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div>
      <PageHeader title={course.title} description={course.description ?? ''} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {allLessons.map((lesson: any, index: number) => (
            <Card key={lesson.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm">{index + 1}</span>
                  <div><div className="font-medium">{lesson.title}</div><div className="text-sm text-muted-foreground">{formatDuration(lesson.duration_mins ?? 0)}</div></div>
                </div>
                <Link to={ROUTES.LEARN_LESSON(courseId!, lesson.id)}><Button size="sm">Start</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <div><Card><CardContent className="p-6"><div className="text-lg font-semibold">Progress</div><div className="mt-2 text-3xl font-bold">{pct}%</div><div className="text-muted-foreground">{completedCount} of {totalCount} lessons completed</div></CardContent></Card></div>
      </div>
    </div>
  );
}
