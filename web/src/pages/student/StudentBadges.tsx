import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useUserBadges } from '@/hooks/queries/useGamification';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Award } from 'lucide-react';
import { Badge } from '@/lib/types';
import { SEO } from '@/components/shared/SEO';

const CATEGORIES = ['All', 'Learning', 'Achievement', 'Streak', 'Special'] as const;

export function StudentBadges() {
  const { data, isLoading } = useUserBadges();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredBadges = useMemo(() => {
    if (!data) return { allBadges: [], userBadges: [] };
    if (activeCategory === 'All') return data;
    return {
      allBadges: data.allBadges.filter(b => b.category === activeCategory.toLowerCase()),
      userBadges: data.userBadges
    };
  }, [data, activeCategory]);

  const earnedIds = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.userBadges.map(ub => ub.badge_id));
  }, [data]);

  const earnedCount = earnedIds.size;
  const totalCount = data?.allBadges.length || 1;
  const totalBadgePoints = data?.allBadges.reduce((sum, b) => sum + (b.points_value || 0), 0) ?? 0;

  return (
    <>
      <SEO title="Badges | EduFlow" />
      <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <PageHeader
          title="My Badges"
          description="Unlock achievements as you progress through your learning journey."
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-4 mb-6 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          You've earned <strong className="text-foreground">{earnedCount}</strong> of{' '}
          <strong className="text-foreground">{data?.allBadges.length ?? 0}</strong> badges
        </span>
        <span className="text-muted-foreground">
          Total badge points: <strong className="text-foreground">{totalBadgePoints}</strong>
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-[250px] rounded-xl" />
          ))}
        </div>
      ) : filteredBadges.allBadges.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No Badges Available</h3>
          <p className="text-muted-foreground">The administrator hasn't added any badges yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.allBadges.map(badge => {
            const userBadge = data?.userBadges.find(ub => ub.badge_id === badge.id);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                userBadge={userBadge}
                showProgress
              />
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
