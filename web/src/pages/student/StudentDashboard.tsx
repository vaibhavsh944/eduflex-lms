import React from 'react'
import { useAuthStore } from '@/store/authStore'
import { useStudentDashboard } from '@/hooks/queries/useStudentDashboard'
import { useCurrentProfile } from '@/hooks/useProfile'
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard'
import { ContinueLearningCard } from '@/components/dashboard/ContinueLearningCard'
import { StreakCalendar } from '@/components/dashboard/StreakCalendar'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { CourseProgressWidget } from '@/components/dashboard/CourseProgressWidget'
import { LevelProgress } from '@/components/gamification/LevelProgress'
import { BookOpen, CheckCircle, BarChart3, Flame } from 'lucide-react'
import { ErrorState } from '@/components/common/ErrorState'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { SEO } from '@/components/shared/SEO'

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useCurrentProfile()
  const { data, isLoading, error, refetch } = useStudentDashboard()

  // Pre-calculate date so it's always available
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <>
      <SEO title="Dashboard | EduFlow" />
      <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
        {/* Header (Always Visible) */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1 tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground flex items-center">
            {dateStr} <span className="mx-2">·</span> <Flame className="w-4 h-4 text-orange-500 mr-1" /> {data?.stats?.currentStreak ?? 0} day streak
          </p>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : error || !data ? (
          <ErrorState title="Couldn't load your dashboard" onRetry={refetch} />
        ) : (
          <>
            {/* Level & XP Progress */}
            <LevelProgress level={profile?.level ?? user?.level ?? 1} totalXp={profile?.total_xp ?? user?.total_xp ?? 0} />

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardStatCard icon={<BookOpen />} value={data.stats.coursesEnrolled} label="Courses Enrolled" colorAccent="blue" />
              <DashboardStatCard icon={<CheckCircle />} value={data.stats.lessonsCompleted} label="Lessons Completed" colorAccent="green" />
              <DashboardStatCard icon={<BarChart3 />} value={`${data.stats.avgQuizScore}%`} label="Avg Quiz Score" colorAccent="amber" />
              <DashboardStatCard icon={<Flame />} value={data.stats.currentStreak} label="Day Streak" colorAccent="orange" />
            </div>

            {/* Continue Learning */}
            {data.continueLearning && (
              <ContinueLearningCard enrollment={data.continueLearning} />
            )}

            {/* Two-column section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <UpcomingDeadlines deadlines={data.upcomingDeadlines} />
              </div>
              <div className="lg:col-span-5">
                <StreakCalendar 
                  activityDates={data.streak?.activity_dates ?? []} 
                  currentStreak={data.streak?.current_streak ?? 0}
                  longestStreak={data.streak?.longest_streak ?? 0}
                />
              </div>
            </div>

            {/* Course Progress */}
            <CourseProgressWidget enrollments={data.enrollments} />
          </>
        )}
      </div>
    </>
  )
}
