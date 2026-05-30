import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'

function QuizRedirect() {
  const { courseId, lessonId } = useParams()
  return <Navigate to={`/learn/${courseId}/lesson/${lessonId}`} replace />
}
import { useAuthStore } from '@/store/authStore'
import { useAuthBootstrap } from '@/hooks/useAuth'

import { ErrorBoundary } from '@/components/guards/ErrorBoundary'
import { PageLoading } from '@/components/shared/PageLoading'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { InstructorLayout } from '@/components/layout/InstructorLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { RoleAwareLayout } from '@/components/layout/RoleAwareLayout'
import { LandingPage } from '@/pages/public/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import StudentDashboard from '@/pages/student/StudentDashboard'
import { InstructorDashboardPage as InstructorDashboard } from '@/pages/instructor/InstructorDashboardPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'

// Less commonly used pages stay lazy
const CatalogPage = lazy(() => import('@/pages/public/CatalogPage').then(m => ({ default: m.CatalogPage })))
const CourseDetailPage = lazy(() => import('@/pages/public/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })))
const AccessibilityPage = lazy(() => import('@/pages/public/AccessibilityPage').then(m => ({ default: m.AccessibilityPage })))
const CertificateVerifyPage = lazy(() => import('@/pages/public/CertificateVerifyPage').then(m => ({ default: m.CertificateVerifyPage })))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage').then(m => ({ default: m.SignupPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })))
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })))
const StudentCourses = lazy(() => import('@/pages/student/StudentCourses'))
const StudentGrades = lazy(() => import('@/pages/student/StudentGrades').then(m => ({ default: m.StudentGrades })))
const ProgressPage = lazy(() => import('@/pages/student/ProgressPage').then(m => ({ default: m.ProgressPage })))
const StudentCertificates = lazy(() => import('@/pages/student/StudentCertificates').then(m => ({ default: m.StudentCertificates })))
const StudentBadges = lazy(() => import('@/pages/student/StudentBadges').then(m => ({ default: m.StudentBadges })))
const StudentAnnouncements = lazy(() => import('@/pages/student/StudentAnnouncements').then(m => ({ default: m.StudentAnnouncements })))
const CoursePlayerPage = lazy(() => import('@/pages/learn/CoursePlayerPage'))
const CoursePlayerRedirect = lazy(() => import('@/pages/learn/CoursePlayerRedirect'))
const LessonViewerPage = lazy(() => import('@/pages/learn/LessonViewerPage'))
const AssignmentPage = lazy(() => import('@/pages/learn/AssignmentPage'))
const StudentLiveListPage = lazy(() => import('@/pages/learn/StudentLiveListPage'))
const StudentLiveRoomPage = lazy(() => import('@/pages/learn/StudentLiveRoomPage'))
const StudentOfficeHoursPage = lazy(() => import('@/pages/learn/StudentOfficeHoursPage'))
const StudyGroupsListPage = lazy(() => import('@/pages/learn/StudyGroupsListPage'))
const StudyGroupRoomPage = lazy(() => import('@/pages/learn/StudyGroupRoomPage'))
const InstructorCourses = lazy(() => import('@/pages/instructor/InstructorCoursesPage').then(m => ({ default: m.InstructorCoursesPage })))
const NewCoursePage = lazy(() => import('@/pages/instructor/NewCoursePage').then(m => ({ default: m.NewCoursePage })))
const CourseBuilderPage = lazy(() => import('@/pages/instructor/CourseBuilderPage').then(m => ({ default: m.CourseBuilderPage })))
const CourseAnalyticsPage = lazy(() => import('@/pages/instructor/CourseAnalyticsPage').then(m => ({ default: m.CourseAnalyticsPage })))
const GradebookPage = lazy(() => import('@/pages/instructor/GradebookPage').then(m => ({ default: m.GradebookPage })))
const QuestionBankPage = lazy(() => import('@/pages/instructor/QuestionBankPage'))
const ProctoringReviewPage = lazy(() => import('@/pages/instructor/ProctoringReviewPage'))
const InstructorRevenuePage = lazy(() => import('@/pages/instructor/InstructorRevenuePage').then(m => ({ default: m.InstructorRevenuePage })))
const LiveSessionManagePage = lazy(() => import('@/pages/instructor/LiveSessionManagePage'))
const InstructorLiveRoomPage = lazy(() => import('@/pages/instructor/InstructorLiveRoomPage'))
const InstructorOfficeHoursPage = lazy(() => import('@/pages/instructor/InstructorOfficeHoursPage').then(m => ({ default: m.InstructorOfficeHoursPage })))
const RecordingsPage = lazy(() => import('@/pages/instructor/RecordingsPage'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })))
const AdminNewUser = lazy(() => import('@/pages/admin/AdminNewUser').then(m => ({ default: m.AdminNewUser })))
const AdminUserDetail = lazy(() => import('@/pages/admin/AdminUserDetail').then(m => ({ default: m.AdminUserDetail })))
const AdminBulkImport = lazy(() => import('@/pages/admin/AdminBulkImport').then(m => ({ default: m.AdminBulkImport })))
const AdminCourses = lazy(() => import('@/pages/admin/AdminCourses').then(m => ({ default: m.AdminCourses })))
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })))
const AdminReports = lazy(() => import('@/pages/admin/AdminReports').then(m => ({ default: m.AdminReports })))
const AdminAnnouncements = lazy(() => import('@/pages/admin/AdminAnnouncements').then(m => ({ default: m.AdminAnnouncements })))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })))
const AdminAuditLogs = lazy(() => import('@/pages/admin/AdminAuditLogs').then(m => ({ default: m.AdminAuditLogs })))
const AdminIntegrationsPage = lazy(() => import('@/pages/admin/AdminIntegrationsPage').then(m => ({ default: m.AdminIntegrationsPage })))
const AdminWebhooksPage = lazy(() => import('@/pages/admin/AdminWebhooksPage').then(m => ({ default: m.AdminWebhooksPage })))
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage').then(m => ({ default: m.AdminCouponsPage })))
const AdminRevenuePage = lazy(() => import('@/pages/admin/AdminRevenuePage').then(m => ({ default: m.AdminRevenuePage })))
const AdminOrganizationsPage = lazy(() => import('@/pages/admin/AdminOrganizationsPage').then(m => ({ default: m.AdminOrganizationsPage })))
const AdminSemestersPage = lazy(() => import('@/pages/admin/AdminSemestersPage').then(m => ({ default: m.AdminSemestersPage })))
const AdminDepartmentsPage = lazy(() => import('@/pages/admin/AdminDepartmentsPage').then(m => ({ default: m.AdminDepartmentsPage })))
const AdminWaitlistsPage = lazy(() => import('@/pages/admin/AdminWaitlistsPage').then(m => ({ default: m.AdminWaitlistsPage })))
const AdminCompliancePage = lazy(() => import('@/pages/admin/AdminCompliancePage').then(m => ({ default: m.AdminCompliancePage })))
const AdminDataRetentionPage = lazy(() => import('@/pages/admin/AdminDataRetentionPage').then(m => ({ default: m.AdminDataRetentionPage })))
const MessagesPage = lazy(() => import('@/pages/shared/MessagesPage').then(m => ({ default: m.MessagesPage })))
const NotificationsPage = lazy(() => import('@/pages/shared/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const LeaderboardPage = lazy(() => import('@/pages/shared/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })))
const ProfilePage = lazy(() => import('@/pages/shared/ProfilePage').then(m => ({ default: m.ProfilePage })))
const ProfileEditPage = lazy(() => import('@/pages/shared/ProfileEditPage').then(m => ({ default: m.ProfileEditPage })))
const SearchPage = lazy(() => import('@/pages/shared/SearchPage').then(m => ({ default: m.SearchPage })))
const ForumPage = lazy(() => import('@/pages/shared/ForumPage').then(m => ({ default: m.ForumPage })))
const ForumThreadPage = lazy(() => import('@/pages/shared/ForumThreadPage').then(m => ({ default: m.ForumThreadPage })))
const ThreadDetailPage = lazy(() => import('@/pages/shared/ThreadDetailPage').then(m => ({ default: m.ThreadDetailPage })))
const ActivityFeedPage = lazy(() => import('@/pages/shared/ActivityFeedPage').then(m => ({ default: m.ActivityFeedPage })))
const AllNotesPage = lazy(() => import('@/pages/shared/AllNotesPage').then(m => ({ default: m.AllNotesPage })))
const MentorshipPage = lazy(() => import('@/pages/shared/MentorshipPage').then(m => ({ default: m.MentorshipPage })))
const PaymentHistoryPage = lazy(() => import('@/pages/shared/PaymentHistoryPage').then(m => ({ default: m.PaymentHistoryPage })))
const IntegrationsPage = lazy(() => import('@/pages/shared/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))
const GdprSettingsPage = lazy(() => import('@/pages/shared/GdprSettingsPage').then(m => ({ default: m.GdprSettingsPage })))

function App() {
  useAuthBootstrap()

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public Routes - No auth required */}
        <Route element={<ErrorBoundary><PublicLayout /></ErrorBoundary>}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:courseId" element={<CourseDetailPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
        </Route>

        {/* Public Verify Route */}
        <Route path="/verify/:certificateId" element={<ErrorBoundary><CertificateVerifyPage /></ErrorBoundary>} />

        {/* Auth Routes */}
        <Route element={<ErrorBoundary><AuthLayout /></ErrorBoundary>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* OAuth Callback */}
        <Route path="/auth/callback" element={<ErrorBoundary><AuthCallbackPage /></ErrorBoundary>} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={['student']} />}>
            <Route element={<ErrorBoundary><StudentLayout /></ErrorBoundary>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/courses" element={<StudentCourses />} />
              <Route path="/student/catalog" element={<CatalogPage />} />
              <Route path="/student/grades" element={<StudentGrades />} />
              <Route path="/student/progress" element={<ProgressPage />} />
              <Route path="/student/certificates" element={<StudentCertificates />} />
              <Route path="/student/badges" element={<StudentBadges />} />
              <Route path="/student/announcements" element={<StudentAnnouncements />} />
              {/* PRD compatibility aliases */}
              <Route path="/certificates" element={<StudentCertificates />} />
              <Route path="/badges" element={<StudentBadges />} />
            </Route>
          </Route>
        </Route>

        {/* Learn Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={['student', 'instructor']} />}>
            <Route path="/learn/:courseId" element={<ErrorBoundary><CoursePlayerPage /></ErrorBoundary>}>
              <Route index element={<CoursePlayerRedirect />} />
              <Route path="lesson/:lessonId" element={<LessonViewerPage />} />
              <Route path="quiz/:lessonId" element={<QuizRedirect />} />
              <Route path="assignment/:lessonId" element={<AssignmentPage />} />
              <Route path="live" element={<StudentLiveListPage />} />
              <Route path="live/:sessionId" element={<StudentLiveRoomPage />} />
              <Route path="office-hours" element={<StudentOfficeHoursPage />} />
              <Route path="study-groups" element={<StudyGroupsListPage />} />
              <Route path="study-groups/:groupId" element={<StudyGroupRoomPage />} />
            </Route>
          </Route>
        </Route>

        {/* Instructor Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={['instructor', 'admin']} />}>
            <Route element={<ErrorBoundary><InstructorLayout /></ErrorBoundary>}>
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/instructor/courses" element={<InstructorCourses />} />
              <Route path="/instructor/courses/new" element={<NewCoursePage />} />
              <Route path="/instructor/courses/:courseId/edit" element={<CourseBuilderPage />} />
              <Route path="/instructor/courses/:courseId/analytics" element={<CourseAnalyticsPage />} />
              <Route path="/instructor/gradebook" element={<GradebookPage />} />
              <Route path="/instructor/courses/:courseId/question-bank" element={<QuestionBankPage />} />
              <Route path="/instructor/revenue" element={<InstructorRevenuePage />} />
              <Route path="/instructor/courses/:courseId/live" element={<LiveSessionManagePage />} />
              <Route path="/instructor/courses/:courseId/live/:sessionId" element={<InstructorLiveRoomPage />} />
              <Route path="/instructor/courses/:courseId/office-hours" element={<InstructorOfficeHoursPage />} />
              <Route path="/instructor/courses/:courseId/recordings" element={<RecordingsPage />} />
            </Route>
            <Route path="/learn/:courseId/quiz/:quizId/proctoring-review" element={<ErrorBoundary><ProctoringReviewPage /></ErrorBoundary>} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={['student', 'instructor', 'admin']} />}>
            <Route element={<ErrorBoundary><AdminLayout /></ErrorBoundary>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/new" element={<AdminNewUser />} />
              <Route path="/admin/users/:id" element={<AdminUserDetail />} />
              <Route path="/admin/users/bulk-import" element={<AdminBulkImport />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/integrations" element={<AdminIntegrationsPage />} />
              <Route path="/admin/webhooks" element={<AdminWebhooksPage />} />
              <Route path="/admin/coupons" element={<AdminCouponsPage />} />
              <Route path="/admin/revenue" element={<AdminRevenuePage />} />
              <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
              <Route path="/admin/semesters" element={<AdminSemestersPage />} />
              <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
              <Route path="/admin/waitlists" element={<AdminWaitlistsPage />} />
              <Route path="/admin/compliance" element={<AdminCompliancePage />} />
              <Route path="/admin/data-retention" element={<AdminDataRetentionPage />} />
            </Route>
          </Route>
        </Route>

        {/* Shared Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ErrorBoundary><RoleAwareLayout /></ErrorBoundary>}>
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:threadId" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/forum/:courseId" element={<ForumPage />} />
            <Route path="/forum/:courseId/thread/:threadId" element={<ForumThreadPage />} />
            <Route path="/forum/:courseId/discussion/:threadId" element={<ThreadDetailPage />} />
            <Route path="/learn/:courseId/discussion" element={<ForumPage />} />
            <Route path="/learn/:courseId/discussion/:threadId" element={<ThreadDetailPage />} />
            <Route path="/profile/payments" element={<PaymentHistoryPage />} />
            <Route path="/profile/integrations" element={<IntegrationsPage />} />
            <Route path="/profile/privacy" element={<GdprSettingsPage />} />
            <Route path="/activity" element={<ActivityFeedPage />} />
            <Route path="/notes" element={<AllNotesPage />} />
            <Route path="/mentorship" element={<MentorshipPage />} />
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
