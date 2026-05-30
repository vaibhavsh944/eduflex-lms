import type { Badge, UserBadge } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Footprints, Zap, Award, GraduationCap, Moon, Trophy, Star, Shield } from 'lucide-react';
import { format } from 'date-fns';

const IconMap: Record<string, any> = {
  footprints: Footprints,
  zap: Zap,
  award: Award,
  'graduation-cap': GraduationCap,
  moon: Moon,
  trophy: Trophy,
  star: Star,
  shield: Shield,
};

interface BadgeCardProps {
  badge: Badge;
  userBadge?: UserBadge;
  showProgress?: boolean;
}

export function BadgeCard({ badge, userBadge }: BadgeCardProps) {
  const isEarned = !!userBadge;
  const iconKey = badge.icon_name || badge.slug || 'trophy';
  const Icon = IconMap[iconKey] || Trophy;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isEarned ? "border-primary/50 shadow-md bg-gradient-to-br from-background to-primary/5" : "opacity-60 grayscale bg-muted/30"
    )}>
      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center border-4",
          isEarned ? "bg-primary/20 border-primary text-primary" : "bg-muted border-muted-foreground text-muted-foreground"
        )}>
          <Icon className="h-8 w-8" />
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
        </div>

        {isEarned ? (
          <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mt-2">
            Earned on {format(new Date(userBadge.earned_at), 'MMM d, yyyy')}
          </div>
        ) : (
          <div className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full mt-2">
            Locked
          </div>
        )}
      </CardContent>
    </Card>
  );
}
