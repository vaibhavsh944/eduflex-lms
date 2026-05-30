import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export function useAdminUsers(filters: { role?: string; status?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(((filters.page ?? 1) - 1) * 25, (filters.page ?? 1) * 25 - 1);

      if (filters.role && filters.role !== 'all') query = query.eq('role', filters.role);
      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.search) query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);

      const { data, error, count } = await query;
      if (error) throw error;
      return { users: (data ?? []), count: count ?? 0 };
    },
  });
}

export function useAdminUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useAdminCourses(filters: { status?: string; search?: string; category?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin-courses', filters],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select('*, instructor:profiles!instructor_id(id, full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(((filters.page ?? 1) - 1) * 25, (filters.page ?? 1) * 25 - 1);

      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
      if (filters.search) query = query.or(`title.ilike.%${filters.search}%,instructor.email.ilike.%${filters.search}%`);

      const { data, error, count } = await query;
      if (error) throw error;
      return { courses: data ?? [], count: count ?? 0 };
    },
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [usersRes, coursesRes, enrollmentsRes, revenueRes] = await Promise.allSettled([
        supabase.from('profiles').select('id, role, created_at'),
        supabase.from('courses').select('id, status'),
        supabase.from('enrollments').select('id, created_at, course_id'),
        supabase.from('payments').select('amount').eq('status', 'paid'),
      ]);

      const users = usersRes.status === 'fulfilled' ? usersRes.value.data ?? [] : [];
      const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.data ?? [] : [];
      const enrollments = enrollmentsRes.status === 'fulfilled' ? enrollmentsRes.value.data ?? [] : [];
      const payments = revenueRes.status === 'fulfilled' ? revenueRes.value.data ?? [] : [];

      const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);
      const totalEnrollments = enrollments.length;
      const totalCourses = courses.length;
      const totalUsers = users.length;

      const instructors = users.filter((u: any) => u.role === 'instructor');
      const students = users.filter((u: any) => u.role === 'student');

      return { totalUsers, totalCourses, totalEnrollments, totalRevenue, instructors: instructors.length, students: students.length };
    },
    staleTime: 60_000,
  });
}

export function useAdminAnalytics(dateRange: string) {
  return useQuery({
    queryKey: ['admin-analytics', dateRange],
    queryFn: async () => {
      const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      const days = daysMap[dateRange] ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const [enrollmentsRes, paymentsRes, progressRes] = await Promise.allSettled([
        supabase.from('enrollments').select('created_at, course_id').gte('created_at', since),
        supabase.from('payments').select('amount, created_at').eq('status', 'paid').gte('created_at', since),
        supabase.from('lesson_progress').select('user_id, updated_at, course_id').gte('updated_at', since),
      ]);

      const enrollments = enrollmentsRes.status === 'fulfilled' ? enrollmentsRes.value.data ?? [] : [];
      const payments = paymentsRes.status === 'fulfilled' ? paymentsRes.value.data ?? [] : [];
      const progress = progressRes.status === 'fulfilled' ? progressRes.value.data ?? [] : [];

      const dailyEnrollments: Record<string, number> = {};
      enrollments.forEach((e: any) => {
        const day = (e.created_at ?? '').split('T')[0];
        dailyEnrollments[day] = (dailyEnrollments[day] ?? 0) + 1;
      });

      const dailyRevenue: Record<string, number> = {};
      payments.forEach((p: any) => {
        const day = (p.created_at ?? '').split('T')[0];
        dailyRevenue[day] = (dailyRevenue[day] ?? 0) + (p.amount ?? 0);
      });

      const uniqueUsers = new Set(progress.map((p: any) => p.user_id));

      const weeklyData = Object.entries(dailyEnrollments).map(([date, count]) => ({
        date,
        enrollments: count,
        revenue: dailyRevenue[date] ?? 0,
      }));

      return {
        weeklyData,
        totalRevenue: payments.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0),
        activeUsers: uniqueUsers.size,
        enrollmentTrend: weeklyData,
      };
    },
    enabled: !!dateRange,
  });
}

export function useAdminAuditLog(filters: { actor?: string; actionType?: string; dateFrom?: string; dateTo?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin-audit', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*, actor:profiles!actor_id(id, full_name, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(((filters.page ?? 1) - 1) * 50, (filters.page ?? 1) * 50 - 1);

      if (filters.actionType) query = query.eq('action_type', filters.actionType);
      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

      const { data, error, count } = await query;
      if (error) throw error;
      return { logs: data ?? [], count: count ?? 0 };
    },
  });
}

export function useAdminAnnouncements() {
  return useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, created_by_profile:profiles!created_by(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
