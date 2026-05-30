export type UserRole = 'student' | 'instructor' | 'admin';

export interface AccessibilityPrefs {
  colorblind_mode: 'none' | 'deuteranopia' | 'protanopia' | 'achromatopsia';
  text_size: 14 | 16 | 18 | 20 | 24;
  line_height: 1.4 | 1.6 | 1.8 | 2.0;
  font_family: 'sans' | 'serif' | 'mono';
  reading_background: 'white' | 'sepia' | 'dark';
  reading_mode_defaults: Record<string, unknown>;
  tts_enabled: boolean;
  tts_speed: number;
}

export interface NotificationPrefs {
  email_grades: boolean;
  email_announcements: boolean;
  email_deadlines: boolean;
  push_messages: boolean;
  push_grades: boolean;
}

export interface Profile {
  readonly id: string;
  readonly org_id: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  headline: string | null;
  website_url: string | null;
  department_id: string | null;
  preferred_language: string;
  timezone: string;
  push_token: string | null;
  referral_code: string | null;
  referral_source: string | null;
  revenue_split_pct: number;
  accessibility_prefs: AccessibilityPrefs;
  notification_prefs: NotificationPrefs;
  points?: number;
  streak_count?: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ProfilePublic {
  readonly id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  headline: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  points: number;
  rank: number;
  course_count: number;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  bio?: string;
  headline?: string;
  website_url?: string;
  preferred_language?: string;
  timezone?: string;
  accessibility_prefs?: Partial<AccessibilityPrefs>;
  notification_prefs?: Partial<NotificationPrefs>;
}
