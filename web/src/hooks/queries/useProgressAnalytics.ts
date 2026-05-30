import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProgressAnalytics, QuizScorePoint, WeeklyActivityPoint, ActivityDay, CourseProgressSummary, SkillRadarPoint } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

interface EnrollRow {
  course_id: string; user_id: string;
  enrolled_at: string | null;
  course: { id: string; title: string; thumbnail_url: string | null; lesson_count: number; category: string } | null;
}
interface QuizRow {
  id: string; score: number; passed: boolean; created_at: string; course_id: string;
  quiz: { id: string; title: string; passing_score: number } | null;
  lesson: { title: string } | null;
  course: { title: string } | null;
}
interface LessonProgressRow {
  lesson_id: string; user_id: string; completed: boolean; completed_at: string | null;
  course_id: string; time_spent_secs: number;
  lesson: { title: string } | null;
}

export function useProgressAnalytics() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery({
    queryKey: ['progressAnalytics', userId],
    queryFn: async (): Promise<ProgressAnalytics> => {
      if (!userId) throw new Error('Not authenticated');

      const [
        enrollmentsRes,
        quizAttemptsRes,
        lessonProgressRes,
        streaksRes,
      ] = await Promise.allSettled([
        supabase.from('enrollments').select('*, course:courses(*)').eq('user_id', userId),
        supabase.from('quiz_attempts').select('*, quiz:quizzes(*), lesson:lessons(title), course:courses(title)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('lesson_progress').select('*, lesson:lessons(title)').eq('user_id', userId),
        supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', userId).maybeSingle(),
      ]);

      const enrollments = (enrollmentsRes.status === 'fulfilled' ? (enrollmentsRes.value.data ?? []) : []) as EnrollRow[];
      const quizAttempts = (quizAttemptsRes.status === 'fulfilled' ? (quizAttemptsRes.value.data ?? []) : []) as QuizRow[];
      const lessonProgress = (lessonProgressRes.status === 'fulfilled' ? (lessonProgressRes.value.data ?? []) : []) as LessonProgressRow[];
      const streaks = (streaksRes.status === 'fulfilled' ? streaksRes.value.data : null) as { current_streak: number; longest_streak: number } | null;

      if (enrollmentsRes.status === 'rejected') console.warn('enrollments query failed:', enrollmentsRes.reason);
      if (quizAttemptsRes.status === 'rejected') console.warn('quiz_attempts query failed:', quizAttemptsRes.reason);
      if (lessonProgressRes.status === 'rejected') console.warn('lesson_progress query failed:', lessonProgressRes.reason);
      if (streaksRes.status === 'rejected') console.warn('user_streaks query failed:', streaksRes.reason);

      const completedLessons = lessonProgress.filter((lp) => lp.completed);
      const totalLessonsCompleted = completedLessons.length;

      const avgQuizScore = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, qa) => sum + (qa.score ?? 0), 0) / quizAttempts.length)
        : 0;

      const completedByCourse = new Map<string, number>();
      lessonProgress.forEach((lp) => {
        if (lp.completed) completedByCourse.set(lp.course_id, (completedByCourse.get(lp.course_id) ?? 0) + 1);
      });

      let coursesCompleted = 0;
      enrollments.forEach((e) => {
        const total = e.course?.lesson_count ?? 0;
        const done = completedByCourse.get(e.course_id) ?? 0;
        if (total > 0 && done >= total) coursesCompleted++;
      });

      const quizScoreHistory: QuizScorePoint[] = quizAttempts.slice(0, 50).map((qa) => ({
        date: qa.created_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        score: qa.score ?? 0,
        passed: qa.passed ?? (qa.score >= (qa.quiz?.passing_score ?? 70)),
        lesson_title: qa.lesson?.title ?? qa.quiz?.title ?? 'Unknown',
        course_title: qa.course?.title ?? 'Unknown',
      }));

      const weeklyMap = new Map<string, { minutes: number; lessons: number }>();
      lessonProgress.forEach((lp) => {
        if (!lp.completed_at) return;
        const d = new Date(lp.completed_at);
        const weekLabel = `${d.getFullYear()}-W${String(Math.ceil((d.getDate() + (d.getDay() + 6) % 7) / 7)).padStart(2, '0')}`;
        const entry = weeklyMap.get(weekLabel) || { minutes: 0, lessons: 0 };
        entry.minutes += Math.round((lp.time_spent_secs ?? 0) / 60);
        if (lp.completed) entry.lessons += 1;
        weeklyMap.set(weekLabel, entry);
      });
      const weeklyActivity: WeeklyActivityPoint[] = Array.from(weeklyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([week_label, data]) => ({
          week_label,
          minutes_studied: data.minutes,
          lessons_completed: data.lessons,
        }));

      const today = new Date();
      const activityDays: ActivityDay[] = [];
      for (let i = 365; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayProgress = lessonProgress.filter((lp) => {
          if (!lp.completed_at) return false;
          const lpDate = new Date(lp.completed_at).toISOString().split('T')[0];
          return lpDate === dateStr;
        });
        const secs = dayProgress.reduce((sum, lp) => sum + (lp.time_spent_secs ?? 0), 0);
        activityDays.push({ date: dateStr, count: Math.round(secs / 60 / 5) });
      }

      const courseProgress: CourseProgressSummary[] = enrollments.map((e) => {
        const courseLessons = lessonProgress.filter((lp) => lp.course_id === e.course_id);
        const totalLessons = e.course?.lesson_count ?? 0;
        const completed = courseLessons.filter((lp) => lp.completed).length;
        const courseQuizAttempts = quizAttempts.filter((qa) => qa.course_id === e.course_id);
        const avgScore = courseQuizAttempts.length > 0
          ? Math.round(courseQuizAttempts.reduce((sum, qa) => sum + (qa.score ?? 0), 0) / courseQuizAttempts.length)
          : null;
        const totalSeconds = courseLessons.reduce((sum, lp) => sum + (lp.time_spent_secs ?? 0), 0);
        const lastCompleted = courseLessons.filter((lp) => lp.completed && lp.completed_at).sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];

        return {
          course_id: e.course_id,
          course_title: e.course?.title || 'Unknown Course',
          thumbnail_url: e.course?.thumbnail_url,
          total_lessons: Math.max(totalLessons, 1),
          completed_lessons: completed,
          avg_quiz_score: avgScore,
          time_spent_minutes: Math.round(totalSeconds / 60),
          enrolled_at: e.enrolled_at ?? '',
          completed_at: totalLessons > 0 && completed >= totalLessons ? (lastCompleted?.completed_at ?? null) : null,
        };
      });

      const categoryMap = new Map<string, number[]>();
      enrollments.forEach((e) => {
        if (e.course?.category) {
          const catQuizAttempts = quizAttempts.filter((qa) => qa.course_id === e.course_id);
          const scores = catQuizAttempts.map((qa) => qa.score ?? 0);
          if (scores.length > 0) {
            const existing = categoryMap.get(e.course.category) ?? [];
            categoryMap.set(e.course.category, [...existing, ...scores]);
          }
        }
      });
      const skillRadar: SkillRadarPoint[] = categoryMap.size > 0
        ? Array.from(categoryMap.entries()).map(([category, scores]) => ({
            category,
            avg_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            fullMark: 100,
          }))
        : [];

      const totalSeconds = lessonProgress.reduce((sum, lp) => sum + (lp.time_spent_secs ?? 0), 0);

      return {
        stats: {
          total_lessons_completed: totalLessonsCompleted,
          total_time_hours: Math.round(totalSeconds / 3600),
          total_quizzes_taken: quizAttempts.length,
          avg_quiz_score: avgQuizScore,
          courses_completed: coursesCompleted,
          current_streak: streaks?.current_streak ?? 0,
          longest_streak: streaks?.longest_streak ?? 0,
        },
        quizScoreHistory,
        weeklyActivity,
        activityDays,
        courseProgress,
        skillRadar,
      };
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}
