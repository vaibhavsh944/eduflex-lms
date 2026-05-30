export interface ForumThread {
  readonly id: string;
  readonly org_id: string | null;
  readonly course_id: string;
  readonly user_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  readonly created_at: string;
  readonly updated_at: string;
  author?: import('./user.types').ProfilePublic;
  reply_count?: number;
  vote_score?: number;
}

export interface ForumReply {
  readonly id: string;
  readonly org_id: string | null;
  readonly thread_id: string;
  readonly user_id: string;
  body: string;
  parent_reply_id: string | null;
  is_accepted: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  author?: import('./user.types').ProfilePublic;
  vote_score?: number;
}

export interface ForumVote {
  readonly id: string;
  readonly user_id: string;
  target_id: string;
  target_type: 'thread' | 'reply';
  value: -1 | 1;
  readonly created_at: string;
}

export interface LessonQA {
  readonly id: string;
  readonly org_id: string | null;
  readonly lesson_id: string;
  readonly user_id: string;
  body: string;
  is_accepted: boolean;
  upvotes: number;
  readonly created_at: string;
  author?: import('./user.types').ProfilePublic;
}

export interface LessonQAReply {
  readonly id: string;
  readonly qa_id: string;
  readonly user_id: string;
  body: string;
  readonly created_at: string;
}
