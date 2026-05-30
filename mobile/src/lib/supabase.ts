// Re-export from shared source of truth to eliminate duplication
export {
  supabase,
  getCurrentUser,
  getProfile,
  fetchEnrolledCourses,
  fetchCourses,
  fetchCourseById,
  fetchLessonById,
  fetchLessonsByCourse,
  fetchNotifications,
  fetchCertificates,
  fetchUserBadges,
  updateProfile,
} from '@shared/utils/supabase';

export type { DatabaseSchema } from '@shared/utils/supabase';
