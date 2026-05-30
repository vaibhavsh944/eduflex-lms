import type { UserRole } from './user.types';

export interface Announcement {
  readonly id: string;
  readonly org_id: string | null;
  readonly author_id: string;
  readonly course_id: string | null;
  target_role: UserRole | null;
  title: string;
  body: string;
  scheduled_at: string | null;
  published_at: string | null;
  readonly created_at: string;
}

export interface CourseReview {
  readonly id: string;
  readonly course_id: string;
  readonly user_id: string;
  rating: number;
  body: string | null;
  readonly created_at: string;
}
