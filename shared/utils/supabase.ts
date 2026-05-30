import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Profile, Course, Enrollment, Notification, Certificate, UserBadge,
  Lesson, Quiz, QuizAttempt, QuizQuestion,
} from '../src/types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const createSupabaseClient = () => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

export const supabase = createSupabaseClient();

export type DatabaseSchema = {
  profiles: Profile;
  courses: Course;
  lessons: Lesson;
  quizzes: Quiz;
  enrollments: Enrollment;
  notifications: Notification;
  certificates: Certificate;
  user_badges: UserBadge;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

export const fetchEnrolledCourses = async (userId: string): Promise<Enrollment[]> => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(*)')
    .eq('user_id', userId);
  if (error) return [];
  return data ?? [];
};

export const fetchCourses = async (params?: {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ courses: Course[]; total: number }> => {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('courses')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params?.category) {
    query = query.eq('category', params.category);
  }
  if (params?.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  const { data, count } = await query;
  return { courses: data ?? [], total: count ?? 0 };
};

export const fetchCourseById = async (courseId: string): Promise<Course | null> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  if (error) return null;
  return data;
};

export const fetchLessonById = async (lessonId: string): Promise<Lesson | null> => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();
  if (error) return null;
  return data;
};

export const fetchLessonsByCourse = async (courseId: string): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  if (error) return [];
  return data ?? [];
};

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
};

export const fetchCertificates = async (userId: string): Promise<Certificate[]> => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*, course:courses(*)')
    .eq('user_id', userId);
  if (error) return [];
  return data ?? [];
};

export const fetchUserBadges = async (userId: string): Promise<UserBadge[]> => {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId);
  if (error) return [];
  return data ?? [];
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { error };
};
