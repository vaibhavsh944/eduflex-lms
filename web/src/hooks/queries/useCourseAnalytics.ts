import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export interface CourseAnalyticsData {
  kpis: {
    totalEnrollments: number;
    completionRate: number;
    avgQuizScore: number;
    activeStudents: number;
  };
  funnelData: { name: string; value: number }[];
  quizScores: { module: string; score: number }[];
  students: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    enrolled_at: string;
    completed_lessons: number;
    total_lessons: number;
    completion_pct: number;
    avg_quiz_score: number | null;
    last_active: string | null;
  }[];
}

export function useCourseAnalytics(courseId: string | undefined) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: async (): Promise<CourseAnalyticsData> => {
      if (!courseId) throw new Error('No course ID');
      if (!user) throw new Error('Not authenticated');

      const courseRes = await supabase
        .from('courses')
        .select('id, instructor_id')
        .eq('id', courseId)
        .single();

      if (courseRes.error || !courseRes.data) throw new Error('Course not found');

      const [
        enrollmentsRes,
        modulesRes,
        quizzesRes,
        lessonProgressRes,
        lessonsRes,
      ] = await Promise.allSettled([
        supabase.from('enrollments').select('*, profile:profiles(id, full_name, avatar_url)').eq('course_id', courseId),
        supabase.from('modules').select('id, title').eq('course_id', courseId).order('position'),
        supabase.from('quizzes').select('id, lesson_id').eq('course_id', courseId),
        supabase.from('lesson_progress').select('user_id, completed, completed_at, created_at, time_spent_secs').eq('course_id', courseId),
        supabase.from('lessons').select('id, module_id').eq('course_id', courseId),
      ]);

      const enrollments = enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value.data ? enrollmentsRes.value.data : [];
      const modules = modulesRes.status === 'fulfilled' && modulesRes.value.data ? modulesRes.value.data : [];
      const courseQuizzes = quizzesRes.status === 'fulfilled' && quizzesRes.value.data ? quizzesRes.value.data : [];
      const lessonProgress = lessonProgressRes.status === 'fulfilled' && lessonProgressRes.value.data ? lessonProgressRes.value.data : [];
      const allLessons = lessonsRes.status === 'fulfilled' && lessonsRes.value.data ? lessonsRes.value.data : [];

      const quizIds = courseQuizzes.map((q: any) => q.id);
      const quizAttemptsRes = quizIds.length > 0
        ? await supabase.from('quiz_attempts').select('score, passed, user_id, created_at, quiz_id').in('quiz_id', quizIds)
        : { data: [] };
      const quizAttempts = quizAttemptsRes.data ?? [];

      const totalLessonsCount = allLessons.length;
      const totalEnrollments = enrollments.length;
      const usersWithAllDone = totalLessonsCount > 0
        ? enrollments.filter((e: any) => {
            const done = lessonProgress.filter((lp: any) => lp.user_id === e.user_id && lp.completed).length;
            return done >= totalLessonsCount;
          }).length
        : 0;
      const completionRate = totalEnrollments > 0 ? Math.round((usersWithAllDone / totalEnrollments) * 100) : 0;

      const avgQuizScore = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum: number, qa: any) => sum + (qa.score ?? 0), 0) / quizAttempts.length)
        : 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeStudentIds = new Set(
        lessonProgress
          .filter((lp: any) => lp.created_at && new Date(lp.created_at) >= sevenDaysAgo)
          .map((lp: any) => lp.user_id)
      );
      const activeStudents = activeStudentIds.size;

      const enrolledCount = enrollments.length;
      const startedCount = enrollments.filter((e: any) => {
        const hasProgress = lessonProgress.some((lp: any) => lp.user_id === e.user_id);
        return hasProgress;
      }).length;
      const midpointCount = enrollments.filter((e: any) => {
        const progress = lessonProgress.filter((lp: any) => lp.user_id === e.user_id && lp.completed);
        return totalLessonsCount > 0 && (progress.length / totalLessonsCount) >= 0.4;
      }).length;
      const funnelData = [
        { name: 'Enrolled', value: enrolledCount || 0 },
        { name: 'Started', value: startedCount || 0 },
        { name: 'Midpoint', value: midpointCount || 0 },
        { name: 'Completed', value: usersWithAllDone || 0 },
      ];

      const quizLessonMap: Record<string, string> = {};
      for (const q of courseQuizzes) {
        if (q.lesson_id) quizLessonMap[q.id] = q.lesson_id;
      }
      const quizScores = modules.map((m: any) => {
        const lessonIds = allLessons.filter((l: any) => l.module_id === m.id).map((l: any) => l.id);
        const moduleQuizIds = courseQuizzes.filter((q: any) => q.lesson_id && lessonIds.includes(q.lesson_id)).map((q: any) => q.id);
        const moduleAttempts = moduleQuizIds.length > 0
          ? quizAttempts.filter((qa: any) => moduleQuizIds.includes(qa.quiz_id))
          : quizAttempts;
        const avgScore = moduleAttempts.length > 0
          ? Math.round(moduleAttempts.reduce((sum: number, qa: any) => sum + (qa.score ?? 0), 0) / moduleAttempts.length)
          : 0;
        return { module: m.title?.substring(0, 10) ?? `Module ${m.position}`, score: avgScore };
      });

      const students = enrollments.map((e: any) => {
        const userProgress = lessonProgress.filter((lp: any) => lp.user_id === e.user_id);
        const totalLessons = Math.max(totalLessonsCount, 1);
        const completed = userProgress.filter((lp: any) => lp.completed).length;
        const userQuizAttempts = quizAttempts.filter((qa: any) => qa.user_id === e.user_id);
        const avgScore = userQuizAttempts.length > 0
          ? Math.round(userQuizAttempts.reduce((sum: number, qa: any) => sum + (qa.score ?? 0), 0) / userQuizAttempts.length)
          : null;
        const lastActive = userProgress.length > 0
          ? userProgress.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at
          : null;

        return {
          id: e.user_id,
          full_name: e.profile?.full_name ?? 'Unknown',
          avatar_url: e.profile?.avatar_url,
          enrolled_at: e.created_at ?? e.enrolled_at,
          completed_lessons: completed,
          total_lessons: Math.max(totalLessons, 1),
          completion_pct: Math.round((completed / Math.max(totalLessons, 1)) * 100),
          avg_quiz_score: avgScore,
          last_active: lastActive,
        };
      });

      return {
        kpis: { totalEnrollments, completionRate, avgQuizScore, activeStudents },
        funnelData,
        quizScores,
        students,
      };
    },
    enabled: !!courseId,
    staleTime: 30_000,
  });
}

export function useCourseModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true });
      return data ?? [];
    },
    enabled: !!courseId,
  });
}
