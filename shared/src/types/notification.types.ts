export type NotificationType =
  | 'new_message'
  | 'grade_posted'
  | 'assignment_due'
  | 'quiz_due'
  | 'course_announcement'
  | 'forum_reply'
  | 'waitlist_enrolled'
  | 'certificate_issued'
  | 'badge_earned'
  | 'live_session_starting'
  | 'office_hours_booked'
  | 'compliance_reminder'
  | 'at_risk_flag';

export interface Notification {
  readonly id: string;
  readonly org_id: string | null;
  readonly user_id: string;
  type: NotificationType;
  message: string;
  title?: string;
  body?: string;
  action_url?: string | null;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  read?: boolean;
  readonly created_at: string;
}
