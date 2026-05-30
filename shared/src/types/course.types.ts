import type { ProfilePublic } from './user.types';

export type ContentStatus = 'draft' | 'published' | 'archived' | 'under_review';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  readonly id: string;
  readonly org_id: string | null;
  readonly instructor_id: string;
  readonly semester_id: string | null;
  readonly department_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  promo_video_url: string | null;
  status: ContentStatus;
  level: CourseLevel;
  language: string;
  category: string | null;
  tags: string[];
  price: number;
  currency: string;
  tax_rate: number;
  max_seats: number | null;
  is_featured: boolean;
  requirements: string[];
  learning_outcomes: string[];
  what_you_learn?: string[];
  content_language: string;
  compliance_required: boolean;
  hr_email: string | null;
  hero_image_url?: string | null;
  instructor_name?: string | null;
  rating?: number;
  review_count?: number;
  duration_hours?: number;
  lesson_count?: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface CourseWithInstructor extends Course {
  instructor: ProfilePublic;
  enrollment_count?: number;
  avg_rating?: number;
  review_count?: number;
}

export interface EnrolledCourse extends Course {
  progress_pct: number;
  last_accessed_lesson_id: string | null;
  enrolled_at: string;
}

export type CourseCreatePayload = Omit<Course,
  'id' | 'org_id' | 'instructor_id' | 'slug' | 'created_at' | 'updated_at'
>;

export type CourseUpdatePayload = Partial<CourseCreatePayload>;

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface CatalogFilters {
  search: string;
  category: string;
  level: CourseLevel | '';
  language: string;
  priceType: 'free' | 'paid' | '';
  rating: number | null;
  sortBy: 'newest' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
  page: number;
}
