// ─── USER & AUTH ─────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'instructor' | 'admin'

export interface Profile {
  id:         string
  email:      string
  full_name:  string
  avatar_url: string | null
  role:       UserRole
  bio:        string | null
  department_id: string | null
  status:     'active' | 'inactive' | 'deleted'
  created_at: string
  updated_at: string
  total_xp:   number
  level:      number
}

// AuthUser is the same shape as Profile — kept separate for semantic clarity
export type AuthUser = Profile

// ─── COURSE ──────────────────────────────────────────────────────────────────

export type CourseStatus   = 'draft' | 'published' | 'archived'
export type CourseLevel    = 'beginner' | 'intermediate' | 'advanced'
export type CourseCategory = 'programming' | 'design' | 'business' | 'marketing' | 'data-science' | 'other'
export type PricingType    = 'free' | 'paid' | 'subscription'

export interface Course {
  id:                 string
  title:              string
  slug?:              string
  description:        string
  short_description?: string
  thumbnail_url:      string | null
  thumbnail?:         string | null            // Backward compatibility
  instructor_id:      string
  instructor:         Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  category:           CourseCategory | string
  level:              CourseLevel | string
  difficulty?:        string                    // Backward compatibility
  pricing_type:       PricingType
  price_type?:        'free' | 'paid'           // Phase 5 schema match
  price:              number
  original_price?:    number
  enrollment_limit?: number | null
  certificate_enabled?: boolean
  is_drip_content?: boolean
  drip_interval_days?: number | null
  language?:        string
  promo_video_url?: string | null
  status:           CourseStatus
  tags:             string[]
  duration_minutes: number
  duration?:        number                   // Backward compatibility
  lesson_count:     number
  enrollment_count: number
  rating:           number
  rating_count:     number
  what_you_learn:   string[]
  requirements:     string[]
  created_at:       string
  updated_at:       string
  is_published?:    boolean                   // Backward compatibility
}

// ─── MODULE & LESSON ─────────────────────────────────────────────────────────

export type LessonType = 'video' | 'pdf' | 'text' | 'quiz' | 'assignment'

export interface Module {
  id:          string
  course_id:   string
  title:       string
  order_index: number
  position?:   number     // Phase 5 schema

  lessons:     Lesson[]
}

export interface Lesson {
  id:               string
  module_id:        string
  course_id:        string
  title:            string
  type:             LessonType
  content_type?:    'video' | 'pdf' | 'text' | 'embed' // Phase 5 schema match
  video_url:        string | null
  youtube_url:      string | null
  content_url:      string | null
  content_text:     string | null
  description?:     string               // Backward compatibility
  duration_minutes: number
  duration?:        number              // Backward compatibility
  order_index:      number
  position?:        number              // Phase 5 schema match
  order?:           number              // Backward compatibility
  is_free_preview:  boolean
  is_published?:    boolean             // Backward compatibility
  created_at:       string
}

// ─── ENROLLMENT & PROGRESS ───────────────────────────────────────────────────

export type EnrollmentStatus = 'active' | 'completed' | 'dropped'

export interface Enrollment {
  id:           string
  user_id:      string
  course_id:    string
  course:       Course
  status:       EnrollmentStatus
  progress:     number         // 0–100
  enrolled_at:  string
  completed_at: string | null
}



// ─── QUIZ ────────────────────────────────────────────────────────────────────

export type QuestionType = 'mcq' | 'true_false' | 'short_answer'

export interface Quiz {
  id:           string
  lesson_id:    string
  course_id:    string
  title:        string
  time_limit:   number | null  // minutes, null = no limit
  max_attempts: number
  pass_score:   number         // percentage required to pass
  questions:    Question[]
  created_at:   string
}

export interface Question {
  id:          string
  quiz_id:     string
  type:        QuestionType
  text:        string
  options:     string[]               // for MCQ; empty for short_answer
  correct:     string | string[]      // correct option(s) or answer text
  explanation: string | null
  order_index: number
  points:      number
}



// ─── ASSIGNMENT ──────────────────────────────────────────────────────────────



export interface Submission {
  id:            string
  assignment_id: string
  user_id:       string
  content:       string                // HTML from TipTap editor (Phase 5)
  file_urls:     string[]
  status:        'submitted' | 'graded' | 'returned'
  grade:         number | null
  score?:        number | null           // Phase 5 schema match
  feedback:      string | null
  submitted_at:  string
  graded_at:     string | null
  graded_by?:    string | null           // Phase 5 schema match
}

// ─── GRADES ──────────────────────────────────────────────────────────────────

export interface Grade {
  id:         string
  user_id:    string
  course_id:  string
  item_id:    string
  item_type:  'quiz' | 'assignment'
  item_title: string
  score:      number
  max_score:  number
  percentage: number
  letter_grade?: string            // Backward compatibility
  lesson_id?:  string | null       // Backward compatibility
  quiz_id?:    string | null       // Backward compatibility
  assignment_id?: string | null   // Backward compatibility
  graded_at:  string
}

// ─── CERTIFICATE & BADGE ─────────────────────────────────────────────────────

export interface Certificate {
  id:                string
  user_id:           string
  course_id:         string
  issued_at:         string
  certificate_url:   string | null
  pdf_url?:          string | null
  verification_code?: string | null
  course?:           Pick<Course, 'id' | 'title' | 'instructor'> & { thumbnail_url?: string | null }
  credential_id?:    string
}

export interface Badge {
  id:               string
  slug?:            string
  name:             string
  description:      string
  icon_name?:       string
  icon_emoji?:      string
  icon_url?:        string | null
  category?:        string
  points_value?:    number
  trigger_type?:    string
  trigger_threshold?: number | null
  criteria_type?:   string
  criteria_value?:  number | null
  created_at:       string
  color?:           string
  criteria?:        string
}

export interface UserBadge {
  id?:        string
  user_id:    string
  badge_id:   string
  earned_at:  string
  badge?:     Badge
}

// ─── POINTS & STREAKS ─────────────────────────────────────────────────────

export interface PointsLog {
  id:           string
  user_id:      string
  points:       number
  reason:       'lesson_complete' | 'quiz_passed' | 'course_complete' | 'badge_earned' | 'streak_milestone' | 'daily_checkin' | 'course_purchased'
  reference_id: string | null
  created_at:   string
}

export interface UserStreak {
  user_id:          string
  current_streak:   number
  longest_streak:   number
  last_checkin_date: string | null
  updated_at:       string
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────

export interface Payment {
  id:                string
  razorpay_order_id:  string
  razorpay_payment_id?: string | null
  user_id:           string
  course_id:         string
  amount:            number
  currency:          string
  status:            'pending' | 'paid' | 'failed' | 'refunded'
  coupon_id?:        string | null
  invoice_url?:      string | null
  paid_at?:          string | null
  created_at:        string
  course?:           Pick<Course, 'id' | 'title' | 'thumbnail_url'>
}

export interface Coupon {
  id:              string
  code:            string
  discount_type:   'percentage' | 'flat'
  discount_value:  number
  max_uses:        number | null
  used_count:      number
  expires_at:      string | null
  course_id:       string | null
  min_order_value: number | null
  is_active:       boolean
  created_at:      string
}

// ─── FORUM ────────────────────────────────────────────────────────────────

export interface ForumThread {
  id:            string
  course_id:     string
  user_id:       string
  title:         string
  body:          string
  is_pinned:     boolean
  is_locked:     boolean
  is_off_topic:  boolean
  reply_count:   number
  upvote_count:  number
  created_at:    string
  updated_at:    string
  author?:       Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>
}

export interface ForumReply {
  id:              string
  thread_id:       string
  user_id:         string
  body:            string
  parent_reply_id: string | null
  is_accepted:     boolean
  upvote_count:    number
  created_at:      string
  updated_at:      string
  author?:         Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>
  replies?:        ForumReply[]
}

export interface ForumVote {
  id:          string
  user_id:     string
  target_id:   string
  target_type: 'thread' | 'reply'
  value:       1 | -1
  created_at:  string
}

export interface LessonQA {
  id:           string
  lesson_id:    string
  user_id:      string
  body:         string
  upvote_count: number
  is_accepted:  boolean
  created_at:   string
  author?:      Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>
  replies?:     LessonQAReply[]
}

export interface LessonQAReply {
  id:         string
  question_id: string
  user_id:    string
  body:       string
  is_accepted: boolean
  created_at: string
  author?:    Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>
}

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────

export interface Announcement {
  id:           string
  title:        string
  content:      string
  author_id:    string
  target_roles: UserRole[]
  course_id:    string | null
  is_published: boolean
  published_at: string
  author:       Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

// ─── MESSAGING ────────────────────────────────────────────────────────────────

export interface Message {
  id:         string
  sender_id:  string
  receiver_id: string
  content:    string
  is_read:    boolean
  created_at: string
  sender:     Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  receiver:   Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export interface Conversation {
  id:            string
  participants:  Pick<Profile, 'id' | 'full_name' | 'avatar_url'>[]
  last_message:  string
  last_message_at: string
  unread_count: number
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id:         string
  user_id:    string
  title:      string
  body:       string
  type:       NotificationType
  read_at:    string | null
  created_at: string
  link_url?:  string
}

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

export interface AuditLog {
  id:          string
  user_id:     string
  action:      string
  entity_type: string
  entity_id:   string
  metadata:    Record<string, unknown>
  created_at:  string
  user:        Pick<Profile, 'id' | 'full_name' | 'email'>
}

// ─── CATALOG FILTER STATE ─────────────────────────────────────────────────

export interface CourseFilters {
  q:         string
  category:  CourseCategory[]
  level:     CourseLevel[]
  pricing:   PricingFilter
  rating:    number | null
  duration:  DurationFilter[]
  language:  string[]
  sort:      CourseSortOption
  page:      number
}

export type PricingFilter  = 'all' | 'free' | 'paid' | 'under500' | '500to2000' | 'above2000'
export type DurationFilter = 'under2h' | '2to5h' | '5to10h' | 'above10h'
export type CourseSortOption =
  | 'popular'
  | 'newest'
  | 'rating'
  | 'price_asc'
  | 'price_desc'

export const DEFAULT_FILTERS: CourseFilters = {
  q:        '',
  category: [],
  level:    [],
  pricing:  'all',
  rating:   null,
  duration: [],
  language: [],
  sort:     'popular',
  page:     1,
}

// ─── PAGINATED RESULT ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data:        T[]
  count:       number
  page:        number
  pageSize:    number
  pageCount:   number
}

// ─── REVIEW (Phase 2) ────────────────────────────────────────────────────

export interface Review {
  id:            string
  course_id:     string
  user_id:       string
  user:          Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  rating:        number
  title:         string | null
  body:          string
  helpful_count: number
  created_at:    string
}

export interface RatingBreakdown {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
  percentages:  Record<1 | 2 | 3 | 4 | 5, number>
}

// ─── COURSE DETAIL (extended) ─────────────────────────────────────────────

export interface CourseWithContent extends Course {
  slug?:             string
  short_description?: string | null
  original_price?:   number | null
  language?:         string
  certificate?:      boolean
  published_at?:     string | null
  modules:           ModuleWithLessons[]
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[]
  description?: string | null
}

// ── Lesson Progress ──────────────────────────────────────────────
export interface LessonProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
  last_position: number
  created_at: string
  updated_at: string
}

// ── Quiz ─────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string
  lesson_id: string
  course_id: string
  question: string
  type: 'mcq' | 'true_false' | 'short_answer'
  explanation: string | null
  points: number
  order_index: number
  quiz_options: QuizOption[]  // eager-loaded via .select('*, quiz_options(*)')
}

export interface QuizOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean          // present in DB; DO NOT render during active attempt
  order_index: number
}

export type StudentAnswers = Record<string, string>  // { question_id: option_id | text }

export interface QuizAttempt {
  id: string
  quiz_id?: string
  user_id: string
  lesson_id: string
  course_id: string
  answers: StudentAnswers
  score: number | null
  max_score: number | null
  passed: boolean | null
  started_at: string
  submitted_at: string | null
  status?: 'in_progress' | 'submitted' | 'graded'
}

export interface QuizGradeResult {
  score: number
  max_score: number
  passed: boolean
  results: Record<string, {
    correct: boolean
    correct_option_id: string
    explanation: string
  }>
}

// ── Assignment ───────────────────────────────────────────────────
export interface RubricCriteria {
  id?: string
  assignment_id?: string
  title?: string
  max_points?: number
  criterion?: string
  points?: number
  description: string
  position?: number
}

export interface RubricScore {
  id?: string
  submission_id: string
  criterion_id: string
  score: number
  comment?: string
}

export interface Assignment {
  id: string
  lesson_id: string
  course_id: string
  title: string
  description: string
  rubric: RubricCriteria[]
  submission_type?: 'text' | 'file' | 'both'
  allowed_types?: string[]
  max_file_mb?: number
  due_at?: string | null
  due_date?: string | null
  max_score?: number
  max_attempts?: number
  passing_score?: number
  created_at: string
  updated_at?: string
}

export interface AssignmentSubmission {
  id: string
  assignment_id: string
  user_id: string
  course_id: string
  text_content: string | null
  file_url: string | null
  file_name: string | null
  file_size_bytes: number | null
  score: number | null
  feedback: string | null
  status: 'submitted' | 'graded' | 'returned'
  submitted_at: string
  graded_at: string | null
  graded_by: string | null
}

// ── Student Notes ────────────────────────────────────────────────
export interface StudentNote {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  content: string
  updated_at: string
}

// ── Course Player State ──────────────────────────────────────────
// Used to represent modules + lessons + progress in the player
export interface PlayerLesson {
  id: string
  title: string
  type: 'video' | 'pdf' | 'text' | 'quiz' | 'assignment'
  duration_minutes: number
  order_index: number
  is_free_preview: boolean
  content_url: string | null
  youtube_url: string | null
  content_text: string | null
  progress: LessonProgress | null  // null if never started
}

export interface PlayerModule {
  id: string
  title: string
  order_index: number
  lessons: PlayerLesson[]
}

export interface CoursePlayerData {
  course: {
    id: string
    title: string
    thumbnail_url: string | null
  }
  modules: PlayerModule[]
  totalLessons: number
  completedLessons: number
  progressPct: number
  lastLessonId: string | null
  isEnrolled: boolean
}

// ── Dashboard ────────────────────────────────────────────────────
export interface DashboardStats {
  coursesEnrolled: number
  lessonsCompleted: number
  certificatesEarned: number
  currentStreak: number
}

export interface UpcomingDeadline {
  assignment_id: string
  assignment_title: string
  course_title: string
  course_id: string
  lesson_id: string
  due_at: string
}

export interface RecentActivity {
  type: 'lesson_complete' | 'quiz_pass' | 'assignment_submit' | 'enrollment'
  title: string
  course_title: string
  occurred_at: string
  icon: 'check' | 'award' | 'upload' | 'book'
}

// ── Enrolled Course (for My Courses page) ────────────────────────
export interface EnrolledCourse {
  enrollment_id: string
  enrolled_at: string
  progress_pct: number
  last_lesson_id: string | null
  completed_at: string | null
  course: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
    category: string
    level: string
    duration_minutes: number
    lesson_count: number
    instructor: {
      id: string
      full_name: string
      avatar_url: string | null
    } | null
  }
}

// ══════════════════════════════════════════════════════════════════
// PHASE 4 TYPES
// ══════════════════════════════════════════════════════════════════

// ── Profile (Extended) ───────────────────────────────────────────
export interface ProfileExtended {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: 'student' | 'instructor' | 'admin'
  bio: string | null
  department_id: string | null
  headline: string | null
  website: string | null
  twitter_handle: string | null
  linkedin_url: string | null
  github_username: string | null
  notification_preferences: NotificationPreferences
  last_seen_at: string | null
  status: 'active' | 'inactive' | 'deleted'
  created_at: string
  updated_at: string
  total_xp: number
  total_points?: number
  level: number
  courses_completed?: number
  badges_count?: number
}

export interface NotificationPreferences {
  email_new_message: boolean
  email_assignment_graded: boolean
  email_quiz_results: boolean
  email_announcements: boolean
  email_deadline_reminders: boolean
  inapp_new_message: boolean
  inapp_assignment_graded: boolean
  inapp_quiz_results: boolean
  inapp_announcements: boolean
  inapp_deadline_reminders: boolean
}

// ── Messages (Phase 4 — replaces Phase 1 stub types) ─────────────
export interface MessageThread {
  id: string
  user_a_id: string
  user_b_id: string
  last_message_at: string
  last_message_preview: string | null
  user_a_read_at: string | null
  user_b_read_at: string | null
  created_at: string
  other_user: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
    last_seen_at: string | null
  }
  has_unread: boolean
}

export interface DirectMessage {
  id: string
  thread_id: string
  sender_id: string
  body: string
  file_url: string | null
  file_name: string | null
  is_deleted: boolean
  sent_at: string
  sender: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

// ── Notifications (Phase 4) ──────────────────────────────────────
export type AppNotificationType =
  | 'new_message'
  | 'quiz_passed'
  | 'quiz_failed'
  | 'assignment_graded'
  | 'assignment_returned'
  | 'course_announcement'
  | 'new_enrollment'
  | 'deadline_reminder'
  | 'course_complete'
  | 'reply_to_post'

export interface AppNotification {
  id: string
  user_id: string
  type: AppNotificationType
  title: string
  body: string
  action_url: string | null
  course_id: string | null
  actor_id: string | null
  read_at: string | null
  created_at: string
  actor?: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}


// ── Progress Analytics ───────────────────────────────────────────
export interface QuizScorePoint {
  date: string
  score: number
  passed: boolean
  lesson_title: string
  course_title: string
}

export interface WeeklyActivityPoint {
  week_label: string
  minutes_studied: number
  lessons_completed: number
}

export interface ActivityDay {
  date: string
  count: number
}

export interface CourseProgressSummary {
  course_id: string
  course_title: string
  thumbnail_url: string | null
  total_lessons: number
  completed_lessons: number
  avg_quiz_score: number | null
  time_spent_minutes: number
  enrolled_at: string
  completed_at: string | null
}

export interface SkillRadarPoint {
  category: string
  avg_score: number
  fullMark: number
}

export interface ProgressAnalytics {
  stats: {
    total_lessons_completed: number
    total_time_hours: number
    total_quizzes_taken: number
    avg_quiz_score: number
    courses_completed: number
    current_streak: number
    longest_streak: number
  }
  quizScoreHistory: QuizScorePoint[]
  weeklyActivity: WeeklyActivityPoint[]
  activityDays: ActivityDay[]
  courseProgress: CourseProgressSummary[]
  skillRadar: SkillRadarPoint[]
}

// ── Global Search ────────────────────────────────────────────────
export interface SearchResult {
  type: 'course' | 'lesson' | 'user'
  id: string
  title: string
  subtitle: string
  url: string
  thumbnail_url: string | null
}

export interface SearchResults {
  courses: SearchResult[]
  lessons: SearchResult[]
  users: SearchResult[]
  total: number
}

// ══════════════════════════════════════════════════════════════════
// PHASE 13 TYPES: Advanced Assessments
// ══════════════════════════════════════════════════════════════════

export type QuestionBankType = 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'drag_match'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface QuestionBankItem {
  id: string
  course_id: string
  topic: string
  body: string
  question_type: QuestionBankType
  options: any | null
  correct_answer: any | null
  difficulty: Difficulty
  points: number
  explanation: string | null
  usage_count: number
  created_at: string
}

export interface CompetencyRequirement {
  id: string
  lesson_id: string
  required_quiz_id: string
  min_score: number
  created_at: string
  required_quiz?: { id: string; title: string } | null
}

export interface ProctoringFlag {
  id: string
  attempt_id: string
  event_type: 'tab_switch' | 'auto_submitted' | 'focus_lost'
  flagged_at: string
}

export interface QuizAdvancedSettings {
  max_attempts: number | null
  grace_period_hours: number
  grace_penalty_pct: number
  randomise_questions: boolean
  randomise_options: boolean
  pick_random_count: number | null
  topic_filter: string | null
  proctoring_enabled: boolean
  show_answers_after: boolean
  time_limit_minutes: number
}

export interface QuizOverviewData {
  id: string
  title: string
  lesson_id: string
  course_id: string
  questions_count: number
  total_points: number
  attempts_remaining: number | null
  max_attempts: number | null
  grace_period_hours: number
  grace_penalty_pct: number
  in_grace_period: boolean
  past_deadline: boolean
  best_score: number | null
  best_passed: boolean | null
  settings: QuizAdvancedSettings
}

export interface CompetencyCheckResult {
  locked: boolean
  required_quiz_id: string | null
  required_quiz_title: string | null
  min_score: number | null
  current_best_score: number | null
}

// ══════════════════════════════════════════════════════════════════
// PHASE 18 TYPES: External Integrations
// ══════════════════════════════════════════════════════════════════

export type IntegrationProvider = 'google_calendar' | 'google_drive' | 'slack' | 'discord'

export interface UserIntegration {
  id: string
  user_id: string
  provider: IntegrationProvider
  connected_at: string
}

export interface WebhookSubscription {
  id: string
  org_id: string
  url: string
  events: string[]
  is_active: boolean
  created_at: string
}

export interface WebhookDelivery {
  id: string
  subscription_id: string
  event_type: string
  status_code: number | null
  response_body: string | null
  delivered_at: string | null
  next_retry_at: string | null
  attempt_count: number
  status: 'pending' | 'success' | 'failed'
}

// ══════════════════════════════════════════════════════════════════
// PHASE 19 TYPES: Payments Extended
// ══════════════════════════════════════════════════════════════════

export interface InstructorEarning {
  id: string
  instructor_id: string
  course_id: string
  payment_id: string
  gross_amount: number
  platform_cut: number
  instructor_amount: number
  payout_status: 'pending' | 'paid'
  paid_at: string | null
  created_at: string
  course?: { title: string } | null
}

export interface Invoice {
  id: string
  payment_id: string
  user_id: string
  invoice_number: string
  pdf_url: string
  tax_amount: number
  issued_at: string
  payment?: { amount: number; course_id: string } | null
}

export interface ReferralConversion {
  id: string
  referrer_id: string
  referred_id: string
  course_id: string | null
  reward_type: string | null
  reward_value: number | null
  converted_at: string
}

export interface UserCredit {
  id: string
  user_id: string
  amount: number
  reason: string | null
  expires_at: string | null
  used: boolean
  created_at: string
}

// ══════════════════════════════════════════════════════════════════
// PHASE 21 TYPES: Advanced Admin
// ══════════════════════════════════════════════════════════════════

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  custom_domain: string | null
  created_at: string
}

export interface Semester {
  id: string
  org_id: string
  name: string
  starts_at: string
  ends_at: string
  is_active: boolean
}

export interface Department {
  id: string
  org_id: string
  name: string
  parent_id: string | null
  head_user_id: string | null
  children?: Department[]
}

export interface WaitlistEntry {
  id: string
  course_id: string
  user_id: string
  position: number
  joined_at: string
  course?: { title: string } | null
  profile?: { full_name: string } | null
}

export interface VideoBookmark {
  id: string
  user_id: string
  lesson_id: string
  timestamp_seconds: number
  label: string | null
  created_at: string
}

export interface DataRetentionLog {
  id: string
  user_id: string | null
  action: 'account_deleted' | 'data_exported' | 'consent_revoked'
  details: Record<string, unknown> | null
  created_at: string
}

// ═══════════════════════════════════════════
// PHASE 14 TYPES: Live Learning
// ═══════════════════════════════════════════

export interface LiveSession {
  id: string
  course_id: string
  instructor_id: string
  name: string
  description: string | null
  scheduled_at: string
  started_at: string | null
  ended_at: string | null
  daily_room_url: string | null
  recording_url: string | null
  enable_whiteboard: boolean
  enable_polls: boolean
  allow_chat: boolean
  created_at: string
}

export interface LivePoll {
  id: string
  session_id: string
  question: string
  options: string[]
  is_active: boolean
  created_at: string
  response_counts?: Record<number, number>
}

export interface LivePollResponse {
  id: string
  poll_id: string
  user_id: string
  chosen_option: number
  responded_at: string
}

export interface OfficeHourSlot {
  id: string
  instructor_id: string
  course_id: string | null
  starts_at: string
  ends_at: string
  is_booked: boolean
  student_id: string | null
  meeting_url: string | null
  is_recurring: boolean
  day_of_week: number | null
  created_at: string
}

export interface HandRaiseEvent {
  user_id: string
  display_name: string
  raised_at: string
}

export interface WhiteboardSnapshot {
  id: string
  session_id: string
  snapshot: unknown
  saved_at: string
}

export interface LiveSessionStore {
  sessionId: string | null
  isHost: boolean
  pollQueue: LivePoll[]
  handRaiseQueue: HandRaiseEvent[]
  activePoll: LivePoll | null
  setActivePoll: (poll: LivePoll | null) => void
  addHandRaise: (event: HandRaiseEvent) => void
  removeHandRaise: (userId: string) => void
  clearQueue: () => void
}

// ═══════════════════════════════════════════
// PHASE 15 TYPES: Social & Collaboration
// ═══════════════════════════════════════════

export interface StudyGroup {
  id: string
  course_id: string
  name: string
  description: string | null
  created_by: string
  max_members: number
  visibility: 'open' | 'invite_only'
  created_at: string
  member_count?: number
  last_activity?: string
}

export interface StudyGroupMember {
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export interface StudyGroupMessage {
  id: string
  group_id: string
  user_id: string
  body: string
  attachment_url: string | null
  edited_at: string | null
  created_at: string
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export interface StudyGroupDoc {
  group_id: string
  content: unknown
  updated_by: string | null
  updated_at: string
}

export interface PeerReviewAssignment {
  id: string
  submission_id: string
  reviewer_id: string
  status: 'pending' | 'in_progress' | 'completed'
  score: Record<string, number> | null
  feedback: string | null
  reviewed_at: string | null
  created_at: string
}

export interface ActivityEvent {
  id: string
  user_id: string
  event_type: string
  payload: Record<string, unknown>
  is_private: boolean
  created_at: string
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export interface CollabNote {
  id: string
  lesson_id: string
  content: unknown
  last_updated_by: string | null
  updated_at: string
}

export interface MentorshipPair {
  id: string
  mentor_id: string
  mentee_id: string
  matched_at: string
  status: 'pending' | 'active' | 'declined' | 'ended'
  ended_at: string | null
  mentor?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  mentee?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

// ═══════════════════════════════════════════
// PHASE 16 TYPES: Rich Content & Media
// ═══════════════════════════════════════════

export type ContentType = 'text' | 'video' | 'code' | 'math' | 'scorm' | 'h5p' | 'embed'

export interface CodeSubmission {
  id: string
  lesson_id: string
  user_id: string
  language: string
  code: string
  test_results: Record<string, unknown> | null
  passed: boolean | null
  submitted_at: string
}

export interface ScormPackage {
  id: string
  lesson_id: string
  storage_path: string
  manifest_data: Record<string, unknown> | null
  entry_point: string | null
  status: 'processing' | 'ready' | 'error'
  created_at: string
}

// ═══════════════════════════════════════════
// PHASE 17 TYPES: Advanced AI
// ═══════════════════════════════════════════

export interface AdaptiveRecommendation {
  user_id: string
  lesson_id: string
  course_id: string
  reason: string
  generated_at: string
  lesson_name?: string
  course_name?: string
}

export interface CourseRecommendation {
  user_id: string
  course_ids: string[]
  generated_at: string
}

export interface AtRiskFlag {
  id: string
  user_id: string
  course_id: string
  reason: 'low_progress' | 'declining_scores' | 'inactive' | 'missed_deadlines'
  flagged_at: string
  resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
}

export interface EssayGrade {
  id: string
  submission_id: string
  ai_score: Record<string, unknown>[] | null
  ai_feedback: string | null
  ai_confidence: number | null
  instructor_override_score: number | null
  instructor_notes: string | null
  graded_at: string
}

export interface CaptionJob {
  id: string
  lesson_id: string
  assemblyai_id: string
  status: string
  error_message: string | null
  created_at: string
}

export interface AiUsageLog {
  id: string
  user_id: string | null
  feature: string
  tokens_used: number | null
  created_at: string
}

export type AiProcessingStatus = 'processing' | 'ready' | 'error' 