import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Course, Module, Lesson } from '@/lib/types';

export function useInstructorDashboard(instructorId: string | undefined) {
  return useQuery({
    queryKey: ['instructor-dashboard', instructorId],
    queryFn: async () => {
      if (!instructorId) throw new Error('No instructor ID');

      const myCoursesRes = await supabase
        .from('courses')
        .select('id, title, status, rating, enrollment_count, thumbnail_url')
        .eq('instructor_id', instructorId)
        .order('enrollment_count', { ascending: false });

      if (myCoursesRes.error) throw myCoursesRes.error;
      const myCourses = myCoursesRes.data ?? [];
      const myCourseIds = myCourses.map(c => c.id);

      const [enrollmentsRes, quizAttemptsRes, paymentsRes] = await Promise.allSettled([
        myCourseIds.length > 0
          ? supabase.from('enrollments').select('id, created_at, course_id, completed_at').in('course_id', myCourseIds)
          : Promise.resolve({ data: [] as any[], error: null }),
        myCourseIds.length > 0
          ? supabase.from('quiz_attempts').select('score').in('course_id', myCourseIds)
          : Promise.resolve({ data: [] as any[], error: null }),
        myCourseIds.length > 0
          ? supabase.from('payments').select('amount, created_at, course_id').in('course_id', myCourseIds).eq('status', 'paid')
          : Promise.resolve({ data: [] as any[], error: null }),
      ]);

      const enrollments = (enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value.data) ? enrollmentsRes.value.data : [];
      const quizAttempts = (quizAttemptsRes.status === 'fulfilled' && quizAttemptsRes.value.data) ? quizAttemptsRes.value.data : [];
      const payments = (paymentsRes.status === 'fulfilled' && paymentsRes.value.data) ? paymentsRes.value.data : [];

      const totalStudents = enrollments.length;
      const activeCourses = myCourses.filter(c => c.status === 'published').length;
      const avgQuizScore = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, qa: any) => sum + (qa.score ?? 0), 0) / quizAttempts.length)
        : 0;
      const totalRevenue = payments.reduce((sum, p: any) => sum + (p.amount ?? 0), 0);
      const avgRating = myCourses.length > 0
        ? Math.round((myCourses.reduce((sum, c: any) => sum + (c.rating ?? 0), 0) / myCourses.length) * 10) / 10
        : 0;

      // Enrollment trend: group by month over last 7 months
      const months: Record<string, number> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short' });
        months[key] = 0;
      }
      enrollments.forEach((e: any) => {
        const d = new Date(e.created_at);
        const key = d.toLocaleString('default', { month: 'short' });
        if (key in months) months[key] += 1;
      });
      const enrollmentTrend = Object.entries(months).map(([month, count]) => ({ month, enrollments: count }));

      // Completion rate per course
      const completionByCourse = myCourses.map(c => {
        const courseEnrollments = enrollments.filter((e: any) => e.course_id === c.id)
        const total = courseEnrollments.length
        const completed = courseEnrollments.filter((e: any) => e.completed_at != null).length
        return { course: c.title, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 }
      })

      const avgCompletionRate = completionByCourse.length > 0
        ? Math.round(completionByCourse.reduce((sum, c) => sum + c.completionRate, 0) / completionByCourse.length)
        : 0

      return { totalStudents, activeCourses, avgCompletionRate, avgQuizScore, totalRevenue, avgRating, enrollmentTrend, completionByCourse, topCourses: myCourses.slice(0, 3) };
    },
    enabled: !!instructorId,
  });
}

export function useInstructorCourses(instructorId: string | undefined) {
  return useQuery({
    queryKey: ['instructor-courses', instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []);
    },
    enabled: !!instructorId,
  });
}

export function useInstructorSubmissions(instructorId: string | undefined) {
  return useQuery({
    queryKey: ['instructor-submissions', instructorId],
    queryFn: async () => {
      if (!instructorId) return [];

      const { data: myCourseIds } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', instructorId);

      if (!myCourseIds?.length) return [];

      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .in('course_id', myCourseIds.map(c => c.id));

      const lessonIds = lessons?.map(l => l.id) ?? [];
      if (!lessonIds.length) return [];

      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, lesson_id')
        .in('lesson_id', lessonIds);

      const assignmentIds = assignments?.map(a => a.id) ?? [];
      if (!assignmentIds.length) return [];

      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*, student:profiles(user_id, id, full_name, avatar_url), assignment:assignments!inner(id, title)')
        .in('assignment_id', assignmentIds)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((s: any) => ({
        ...s,
        user_id: s.user_id,
        content: s.text_content,
        file_urls: s.file_url ? [s.file_url] : [],
        status: s.score != null ? 'graded' : 'submitted',
        grade: s.score,
        graded_by: s.graded_by,
      }));
    },
    enabled: !!instructorId,
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, ...data }: { courseId: string } & Partial<Course>) => {
      const { error } = await supabase
        .from('courses')
        .update(data)
        .eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const slug = courseData.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `course-${Date.now()}`;
      const { data, error } = await supabase.from('courses').insert({
        title: courseData.title,
        slug,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        pricing_type: (courseData.pricing_type ?? courseData.price_type ?? 'free') as 'free' | 'paid' | 'subscription',
        price_type: (courseData.price_type ?? courseData.pricing_type ?? 'free') as 'free' | 'paid',
        price: courseData.price ?? 0,
        tags: courseData.tags ?? [],
        language: courseData.language ?? 'English',
        instructor_id: courseData.instructor_id,
        status: 'published',
        published_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'catalog'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['course-count'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['course', data.id] });
      }
    },
  });
}

export function useCourseCurriculum(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course-curriculum', courseId],
    queryFn: async () => {
      if (!courseId) return { course: null, modules: [], lessons: [] };

      const [courseRes, modulesRes, lessonsRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('modules').select('*').eq('course_id', courseId).order('position', { ascending: true }),
        supabase.from('lessons').select('*').eq('course_id', courseId).order('position', { ascending: true }),
      ]);

      return {
        course: courseRes.data ?? null,
        modules: (modulesRes.data ?? []),
        lessons: (lessonsRes.data ?? []),
      };
    },
    enabled: !!courseId,
  });
}

export function useReorderCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modules, lessons }: { modules: Module[]; lessons: Lesson[] }) => {
      const lessonPromises = lessons.map((l, i) =>
        supabase.from('lessons').update({ position: i, module_id: l.module_id }).eq('id', l.id)
      );
      const modulePromises = modules.map((m, i) =>
        supabase.from('modules').update({ position: i }).eq('id', m.id)
      );
      const results = await Promise.all([...lessonPromises, ...modulePromises]);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      if (variables.modules.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['course-curriculum', variables.modules[0].course_id] });
      }
    },
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, title }: { courseId: string; title?: string }) => {
      const { data: modules } = await supabase
        .from('modules')
        .select('position')
        .eq('course_id', courseId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPos = modules && modules.length > 0 ? modules[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: title || `Module ${nextPos + 1}`,
          position: nextPos,
          is_published: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', variables.courseId] });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const { data: mod } = await supabase.from('modules').select('course_id').eq('id', moduleId).maybeSingle();
      const { error } = await supabase.from('modules').delete().eq('id', moduleId);
      if (error) throw error;
      return { courseId: mod?.course_id };
    },
    onSuccess: (data) => {
      if (data?.courseId) {
        queryClient.invalidateQueries({ queryKey: ['course-curriculum', data.courseId] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete module');
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, courseId, title }: { moduleId: string; courseId: string; title?: string }) => {
      const { data: lessons, error: posErr } = await supabase
        .from('lessons')
        .select('position')
        .eq('module_id', moduleId)
        .order('position', { ascending: false })
        .limit(1);

      if (posErr) throw posErr;
      const nextPos = lessons && lessons.length > 0 ? lessons[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('lessons')
        .insert({
          module_id: moduleId,
          course_id: courseId,
          title: title || `Lesson ${nextPos + 1}`,
          content_type: 'text',
          position: nextPos,
          is_published: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', variables.courseId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create lesson');
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { data: less } = await supabase.from('lessons').select('course_id').eq('id', lessonId).maybeSingle();
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if (error) throw error;
      return { courseId: less?.course_id };
    },
    onSuccess: (data) => {
      if (data?.courseId) {
        queryClient.invalidateQueries({ queryKey: ['course-curriculum', data.courseId] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete lesson');
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, courseId, ...data }: { lessonId: string; courseId?: string } & Record<string, any>) => {
      const { error } = await supabase
        .from('lessons')
        .update(data)
        .eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', variables.courseId] });
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save lesson');
    },
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) => {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          score,
          feedback,
          graded_at: new Date().toISOString(),
          graded_by: (await supabase.auth.getUser()).data.user?.id ?? undefined,
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-submissions'] });
    },
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, lessonsCount }: { courseId: string; lessonsCount: number }) => {
      if (lessonsCount === 0) {
        throw new Error('Cannot publish a course with no lessons. Add at least one lesson first.');
      }
      const { error } = await supabase
        .from('courses')
        .update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      const cid = variables.courseId;
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['course', cid] });
      queryClient.invalidateQueries({ queryKey: ['course-curriculum', cid] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'catalog'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['course-count'] });
      queryClient.invalidateQueries({ queryKey: ['course-player', cid] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', cid] });
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
      toast.success('Course published! Changes are now live for all students.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Publish failed');
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'catalog'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['course-count'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete course');
    },
  });
}
