export interface Enrollment {
  readonly id: string;
  readonly org_id: string | null;
  readonly user_id: string;
  readonly course_id: string;
  readonly enrolled_at: string;
  expires_at: string | null;
  course?: Record<string, unknown>;
  progress_percent?: number;
  completed_at?: string | null;
  completed_lessons?: string[];
  last_accessed_lesson_id?: string | null;
  updated_at?: string;
}

export interface Waitlist {
  readonly id: string;
  readonly course_id: string;
  readonly user_id: string;
  position: number;
  readonly joined_at: string;
}
