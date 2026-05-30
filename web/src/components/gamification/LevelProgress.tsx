import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  totalXp: number;
}

export function LevelProgress({ level, totalXp }: LevelProgressProps) {
  // Formula: Level = floor(sqrt(total_xp / 100)) + 1
  // XP needed for current level = 100 * (level - 1)^2
  // XP needed for next level = 100 * (level)^2
  
  const xpCurrentLevelStart = 100 * Math.pow(level - 1, 2);
  const xpNextLevelStart = 100 * Math.pow(level, 2);
  
  const xpInCurrentLevel = totalXp - xpCurrentLevelStart;
  const xpNeededForNextLevel = xpNextLevelStart - xpCurrentLevelStart;
  
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0 relative">
          <div className="h-20 w-20 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-inner">
            <span className="text-3xl font-black text-primary">{level}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center border-2 border-background shadow-sm">
            <Zap className="h-4 w-4 text-white fill-current" />
          </div>
        </div>
        
        <div className="flex-1 w-full space-y-3 text-center sm:text-left">
          <div>
            <h3 className="font-bold text-lg">Level {level}</h3>
            <p className="text-sm text-muted-foreground">
              {xpNextLevelStart - totalXp} XP remaining until Level {level + 1}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium px-1">
              <span>{totalXp} XP</span>
              <span className="text-muted-foreground">{xpNextLevelStart} XP</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-primary/20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
