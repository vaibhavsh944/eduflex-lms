export type LessonContentType = 'video' | 'pdf' | 'text' | 'code' | 'math' | 'scorm' | 'h5p' | 'embed';

export interface Lesson {
  readonly id: string;
  readonly org_id: string | null;
  readonly module_id: string;
  readonly course_id: string;
  title: string;
  description: string | null;
  content_type: LessonContentType;
  content: Record<string, unknown> | null;
  video_url: string | null;
  video_duration: number | null;
  pdf_url: string | null;
  captions_url: string | null;
  embed_url: string | null;
  position: number;
  order_index?: number;
  is_preview: boolean;
  is_free?: boolean;
  is_published: boolean;
  duration_mins: number;
  duration_seconds?: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Module {
  readonly id: string;
  readonly org_id: string | null;
  readonly course_id: string;
  title: string;
  description: string | null;
  position: number;
  is_published: boolean;
  lessons?: Lesson[];
  readonly created_at: string;
  readonly updated_at: string;
}

export interface LessonProgress {
  readonly id: string;
  readonly org_id: string | null;
  readonly user_id: string;
  readonly lesson_id: string;
  readonly course_id: string;
  completed: boolean;
  completed_at: string | null;
  last_position: number;
  time_spent_secs: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface VideoBookmark {
  readonly id: string;
  readonly user_id: string;
  readonly lesson_id: string;
  timestamp_seconds: number;
  label: string | null;
  readonly created_at: string;
}

export interface DownloadedLesson {
  readonly id: string;
  readonly user_id: string;
  readonly lesson_id: string;
  file_path: string;
  readonly downloaded_at: string;
}
