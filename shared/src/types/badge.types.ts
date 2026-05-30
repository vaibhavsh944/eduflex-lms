export interface BadgeCondition {
  type: 'lesson_count' | 'quiz_pass_count' | 'streak_days' | 'course_complete' | 'points_threshold';
  threshold: number;
  course_id?: string;
}

export interface Badge {
  readonly id: string;
  readonly org_id: string | null;
  name: string;
  description: string | null;
  icon_url: string | null;
  image_url?: string | null;
  category?: string;
  condition: BadgeCondition;
  readonly created_at: string;
}

export interface UserBadge {
  readonly id?: string;
  readonly user_id: string;
  readonly badge_id: string;
  readonly earned_at: string;
  badge?: Badge;
  progress?: number | null;
}

export interface UserPoints {
  readonly user_id: string;
  points: number;
  last_updated: string;
}

export interface UserStreak {
  readonly user_id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
}
