import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';

export function StudentProgress() {
  const user = useAuthStore(s => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['student-progress', user?.id],
    queryFn: async () => {
      if (!user) return { avgProgress: 0, totalHours: 0 };
      const { data: enrollments } = await supabase.from('enrollments').select('course_id').eq('user_id', user.id);
      if (!enrollments?.length) return { avgProgress: 0, totalHours: 0 };
      const courseIds = enrollments.map(e => e.course_id);
      const { data: progress } = await supabase.from('lesson_progress').select('completed, time_spent_secs').in('course_id', courseIds).eq('user_id', user.id);
      const completed = progress?.filter(p => p.completed).length ?? 0;
      const totalSecs = progress?.reduce((s, p) => s + (p.time_spent_secs ?? 0), 0) ?? 0;
      const { count: totalLessons } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).in('course_id', courseIds);
      return {
        avgProgress: totalLessons && totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
        totalHours: Math.round(totalSecs / 3600),
      };
    },
    enabled: !!user,
  });

  return (
    <div>
      <PageHeader title="Progress" description="Track your learning progress" />
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardContent className="p-6"><Skeleton className="h-9 w-16" /><Skeleton className="h-4 w-32 mt-2" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-9 w-16" /><Skeleton className="h-4 w-32 mt-2" /></CardContent></Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardContent className="p-6"><div className="text-3xl font-bold">{stats?.avgProgress ?? 0}%</div><div className="text-muted-foreground">Average Progress</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="text-3xl font-bold">{stats?.totalHours ?? 0}h</div><div className="text-muted-foreground">Total Learning Time</div></CardContent></Card>
        </div>
      )}
    </div>
  );
}
