import type { ProfileExtended } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

interface LeaderboardTableProps {
  profiles: ProfileExtended[];
  currentUserId?: string;
}

export function LeaderboardTable({ profiles, currentUserId }: LeaderboardTableProps) {
  const userIndex = profiles.findIndex(p => p.id === currentUserId);
  const isOutsideTop = currentUserId && userIndex === -1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-slate-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-700" />;
      default: return <span className="font-bold text-muted-foreground w-6 text-center">{rank}</span>;
    }
  };

  const podium = (
    <div className="flex items-end justify-center gap-4 mb-8">
      {profiles.length >= 2 && (
        <div className="flex flex-col items-center w-28">
          <Avatar className="h-14 w-14 border-2 border-slate-400 mb-1">
            <AvatarImage src={profiles[1].avatar_url || undefined} />
            <AvatarFallback>{profiles[1].full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold truncate w-full text-center">{profiles[1].full_name}</p>
          <div className="bg-gradient-to-r from-slate-400 to-slate-500 text-white font-bold text-sm px-4 py-1 rounded-t-md mt-1 w-full text-center shadow">2nd</div>
        </div>
      )}
      {profiles.length >= 1 && (
        <div className="flex flex-col items-center w-28">
          <Crown className="h-6 w-6 text-yellow-500 -mb-1" />
          <Avatar className="h-16 w-16 border-2 border-yellow-500 shadow-lg shadow-yellow-500/20">
            <AvatarImage src={profiles[0].avatar_url || undefined} />
            <AvatarFallback className="bg-yellow-100 text-yellow-700">{profiles[0].full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold truncate w-full text-center">{profiles[0].full_name}</p>
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-sm px-4 py-1 rounded-t-md mt-1 w-full text-center shadow">1st</div>
        </div>
      )}
      {profiles.length >= 3 && (
        <div className="flex flex-col items-center w-28">
          <Avatar className="h-12 w-12 border-2 border-amber-700 mb-1">
            <AvatarImage src={profiles[2].avatar_url || undefined} />
            <AvatarFallback>{profiles[2].full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold truncate w-full text-center">{profiles[2].full_name}</p>
          <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white font-bold text-sm px-4 py-1 rounded-t-md mt-1 w-full text-center shadow">3rd</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {profiles.length >= 1 && podium}

      <div className="grid grid-cols-[40px_1fr_60px_80px_80px_60px] gap-4 p-4 border-b bg-muted/30 text-sm font-semibold text-muted-foreground items-center">
        <div className="text-center">Rank</div>
        <div>Student</div>
        <div className="text-center">Level</div>
        <div className="text-right">XP</div>
        <div className="text-right">Courses</div>
        <div className="text-right">Badges</div>
      </div>

      <div className="divide-y">
        {profiles.map((profile, index) => {
          const rank = index + 1;
          const isCurrentUser = profile.id === currentUserId;
          const initials = profile.full_name?.substring(0, 2).toUpperCase() ?? '??';

          return (
            <div
              key={profile.id}
              className={cn(
                "grid grid-cols-[40px_1fr_60px_80px_80px_60px] gap-4 p-4 items-center transition-colors hover:bg-muted/50",
                isCurrentUser && "bg-primary/5 hover:bg-primary/10 sticky -bottom-px"
              )}
            >
              <div className="flex justify-center">
                {getRankIcon(rank)}
              </div>

              <Link to={ROUTES.PROFILE_PUBLIC(profile.id)} className="flex items-center gap-3 min-w-0">
                <Avatar className={cn("h-10 w-10 border", isCurrentUser && "border-primary")}>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="truncate">
                  <p className={cn("font-semibold truncate", isCurrentUser && "text-primary")}>
                    {profile.full_name} {isCurrentUser && "(You)"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
              </Link>

              <div className="text-center">
                <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold h-7 w-7 rounded-full text-xs">
                  {profile.level ?? 1}
                </span>
              </div>

              <div className="text-right font-mono font-medium">
                {profile.total_points ?? profile.total_xp ?? 0}
              </div>

              <div className="text-right font-mono text-sm text-muted-foreground">
                {profile.courses_completed ?? 0}
              </div>

              <div className="text-right font-mono text-sm text-muted-foreground">
                {profile.badges_count ?? 0}
              </div>
            </div>
          );
        })}

        {profiles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No students found on the leaderboard yet.
          </div>
        )}
      </div>

      {isOutsideTop && (
        <div className="border-t bg-primary/5 p-4 text-center text-sm font-medium text-muted-foreground">
          Your rank: #{profiles.length + 1} — outside the top {profiles.length}
        </div>
      )}
    </div>
  );
}
