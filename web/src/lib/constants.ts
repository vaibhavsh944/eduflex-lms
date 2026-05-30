import type { UserRole } from './types';

export const ROUTES = {
  // Public
  HOME: '/',
  CATALOG: '/catalog',
  COURSE_DETAIL: (courseId: string) => `/catalog/${courseId}`,

  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN_LOGIN: '/admin/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  AUTH_CALLBACK: '/auth/callback',

  // Student
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_COURSES: '/student/courses',
  STUDENT_CATALOG: '/student/catalog',
  STUDENT_GRADES: '/student/grades',
  STUDENT_PROGRESS: '/student/progress',
  STUDENT_CERTIFICATES: '/student/certificates',
  STUDENT_BADGES: '/student/badges',
  STUDENT_ANNOUNCEMENTS: '/student/announcements',

  // Learn
  LEARN_COURSE: (courseId: string) => `/learn/${courseId}`,
  LEARN_LESSON: (courseId: string, lessonId: string) => `/learn/${courseId}/lesson/${lessonId}`,
  LEARN_QUIZ: (courseId: string, quizId: string) => `/learn/${courseId}/quiz/${quizId}`,
  LEARN_ASSIGNMENT: (courseId: string, assignmentId: string) => `/learn/${courseId}/assignment/${assignmentId}`,

  // Instructor
  INSTRUCTOR_DASHBOARD: '/instructor',
  INSTRUCTOR_COURSES: '/instructor/courses',
  INSTRUCTOR_NEW_COURSE: '/instructor/courses/new',
  INSTRUCTOR_COURSE_EDIT: (id: string) => `/instructor/courses/${id}/edit`,
  INSTRUCTOR_COURSE_ANALYTICS: (id: string) => `/instructor/courses/${id}/analytics`,
  INSTRUCTOR_GRADEBOOK: '/instructor/gradebook',
  INSTRUCTOR_QUESTION_BANK: (courseId: string) => `/instructor/courses/${courseId}/question-bank`,
  INSTRUCTOR_PROCTORING_REVIEW: (courseId: string, quizId: string) => `/learn/${courseId}/quiz/${quizId}/proctoring-review`,

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_NEW_USER: '/admin/users/new',
  ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
  ADMIN_BULK_IMPORT: '/admin/users/bulk-import',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_INTEGRATIONS: '/admin/integrations',
  ADMIN_WEBHOOKS: '/admin/webhooks',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_REVENUE: '/admin/revenue',
  INSTRUCTOR_REVENUE: '/instructor/revenue',
  ADMIN_ORGANIZATIONS: '/admin/organizations',
  ADMIN_SEMESTERS: '/admin/semesters',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_WAITLISTS: '/admin/waitlists',
  ADMIN_COMPLIANCE: '/admin/compliance',

  // Phase 18
  PROFILE_INTEGRATIONS: '/profile/integrations',

  // Shared
  MESSAGES: '/messages',
  MESSAGES_THREAD: (threadId: string) => `/messages/${threadId}`,
  NOTIFICATIONS: '/notifications',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_PROGRESS: '/profile/progress',
  PROFILE_PAYMENTS: '/profile/payments',
  PROFILE_GDPR: '/profile/privacy',

  // Admin data retention
  ADMIN_DATA_RETENTION: '/admin/data-retention',
  PROFILE_PUBLIC: (userId: string) => `/profile/${userId}`,
  SEARCH: '/search',
  FORUM: (courseId: string) => `/forum/${courseId}`,
  FORUM_THREAD: (courseId: string, threadId: string) => `/forum/${courseId}/discussion/${threadId}`,

  // Errors
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
} as const;

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  student: ROUTES.STUDENT_DASHBOARD,
  instructor: ROUTES.INSTRUCTOR_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
};

export const NAV_LABELS = {
  // Student nav
  student: {
    dashboard: 'Dashboard',
    myCourses: 'My Courses',
    grades: 'Grades',
    progress: 'Progress',
    certificates: 'Certificates',
    badges: 'Badges',
    announcements: 'Announcements',
    payments: 'Payments',
  },
  // Instructor nav
  instructor: {
    dashboard: 'Dashboard',
    myCourses: 'My Courses',
    createCourse: 'Create Course',
    revenue: 'Revenue',
  },
  // Admin nav
  admin: {
    dashboard: 'Dashboard',
    users: 'Users',
    courses: 'Courses',
    analytics: 'Analytics',
    reports: 'Reports',
    announcements: 'Announcements',
    settings: 'Settings',
    auditLogs: 'Audit Logs',
    coupons: 'Coupons',
    revenue: 'Revenue',
  },
  // Shared nav
  shared: {
    messages: 'Messages',
    notifications: 'Notifications',
    leaderboard: 'Leaderboard',
    profile: 'Profile',
    search: 'Search',
  },
};

export const COURSE_CATEGORIES = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'Language',
  'Music',
  'Photography',
] as const;

// ═══════════════════════════════════════════
// PHASE 14 ROUTES: Live Learning
// ═══════════════════════════════════════════
export const LIVE_INSTRUCTOR_MANAGE: (courseId: string) => string = (courseId) => `/instructor/courses/${courseId}/live`
export const LIVE_INSTRUCTOR_ROOM: (courseId: string, sessionId: string) => string = (courseId, sessionId) => `/instructor/courses/${courseId}/live/${sessionId}`
export const LIVE_STUDENT_LIST: (courseId: string) => string = (courseId) => `/learn/${courseId}/live`
export const LIVE_STUDENT_ROOM: (courseId: string, sessionId: string) => string = (courseId, sessionId) => `/learn/${courseId}/live/${sessionId}`
export const INSTRUCTOR_OFFICE_HOURS: (courseId: string) => string = (courseId) => `/instructor/courses/${courseId}/office-hours`
export const STUDENT_OFFICE_HOURS: (courseId: string) => string = (courseId) => `/learn/${courseId}/office-hours`
export const INSTRUCTOR_RECORDINGS: (courseId: string) => string = (courseId) => `/instructor/courses/${courseId}/recordings`

// ═══════════════════════════════════════════
// PHASE 15 ROUTES: Social & Collaboration
// ═══════════════════════════════════════════
export const STUDY_GROUPS_LIST: (courseId: string) => string = (courseId) => `/learn/${courseId}/study-groups`
export const STUDY_GROUP_ROOM: (courseId: string, groupId: string) => string = (courseId, groupId) => `/learn/${courseId}/study-groups/${groupId}`
export const ACTIVITY_FEED = '/activity'
export const ALL_NOTES = '/notes'
export const MENTORSHIP = '/mentorship'

// ═══════════════════════════════════════════
// PHASE 16 CONSTANTS
// ═══════════════════════════════════════════
export const CONTENT_TYPES = ['text', 'video', 'code', 'math', 'scorm', 'h5p', 'embed'] as const
export const CODE_LANGUAGES = ['javascript', 'python', 'typescript', 'java', 'cpp', 'go', 'rust', 'ruby', 'php', 'sql'] as const

// ═══════════════════════════════════════════
// PHASE 17 CONSTANTS
// ═══════════════════════════════════════════
export const AI_RATE_LIMITS = {
  ADAPTIVE_PATH_CACHE_MINUTES: 30,
  RECOMMENDATIONS_CACHE_MINUTES: 60,
  ESSAY_GRADE_DAILY_LIMIT: 50,
  SEMANTIC_SEARCH_HOURLY_LIMIT: 60,
} as const

export const AT_RISK_REASONS = ['low_progress', 'declining_scores', 'inactive', 'missed_deadlines'] as const

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const BANNER_MESSAGES = {
  welcome: 'Welcome to EduFlow!',
  coursePublished: 'Your course has been published!',
  enrollmentSuccess: 'Successfully enrolled in course!',
};

export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  authFailed: 'Authentication failed. Please try again.',
};

export const SUCCESS_MESSAGES = {
  profileUpdated: 'Profile updated successfully!',
  courseCreated: 'Course created successfully!',
  coursePublished: 'Course published successfully!',
  enrollmentSuccess: 'Successfully enrolled in course!',
};