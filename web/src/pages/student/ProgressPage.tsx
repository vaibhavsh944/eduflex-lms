import { useProgressAnalytics } from '@/hooks/queries/useProgressAnalytics';
import { PageHeader } from '@/components/common/PageHeader';
import { StatSummaryRow } from '@/components/progress/StatSummaryRow';
import { ScoreHistoryChart } from '@/components/progress/ScoreHistoryChart';
import { WeeklyActivityChart } from '@/components/progress/WeeklyActivityChart';
import { ActivityHeatmap } from '@/components/progress/ActivityHeatmap';
import { SkillBreakdownChart } from '@/components/progress/SkillBreakdownChart';
import { CourseCompletionCard } from '@/components/progress/CourseCompletionCard';
import { SkeletonPage } from '@/components/common/SkeletonPage';

export function ProgressPage() {
  const { data, isLoading, isError, error } = useProgressAnalytics();

  if (isLoading) return <SkeletonPage />;
  if (isError || !data) return (
    <div className="space-y-6">
      <PageHeader title="Learning Analytics" description="Track your progress, scores, and learning habits." />
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-muted-foreground">
          {error ? `Failed to load: ${error.message}` : 'Progress data is not available right now.'}
        </p>
        <p className="text-sm text-muted-foreground">Try refreshing the page.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Learning Analytics" 
        description="Track your progress, scores, and learning habits."
      />

      <StatSummaryRow stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ScoreHistoryChart data={data.quizScoreHistory} />
        <WeeklyActivityChart data={data.weeklyActivity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityHeatmap data={data.activityDays} />
        </div>
        <div>
          <SkillBreakdownChart data={data.skillRadar} />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Course Progress</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.courseProgress.map(course => (
            <CourseCompletionCard key={course.course_id} course={course} />
          ))}
          {data.courseProgress.length === 0 && (
            <p className="text-muted-foreground col-span-full">You haven't enrolled in any courses yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
