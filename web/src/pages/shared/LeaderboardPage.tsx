import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useLeaderboard, useLeaderboardByCourse } from '@/hooks/queries/useGamification';
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/shared/SEO';
import { useAuthStore } from '@/store/authStore';

export function LeaderboardPage() {
  const currentUserId = useAuthStore(state => state.user?.id);
  const [activeTab, setActiveTab] = useState<'global' | 'courses'>('global');

  const { data: globalProfiles, isLoading: globalLoading } = useLeaderboard(50);
  const { data: courseProfiles, isLoading: courseLoading } = useLeaderboardByCourse();

  const profiles = activeTab === 'global' ? globalProfiles : courseProfiles;
  const isLoading = activeTab === 'global' ? globalLoading : courseLoading;

  return (
    <>
      <SEO title="Leaderboard | EduFlow" />
      <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 text-center sm:text-left">
        <PageHeader
          title="Leaderboard"
          description="See how you rank against other students on EduFlow."
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'global'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Global
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'courses'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          My Courses
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      ) : (
        <LeaderboardTable
          profiles={profiles || []}
          currentUserId={currentUserId}
        />
      )}
    </div>
    </>
  );
}
