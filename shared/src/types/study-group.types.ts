export interface StudyGroup {
  readonly id: string;
  readonly org_id: string | null;
  readonly course_id: string;
  name: string;
  readonly created_by: string;
  max_members: number;
  readonly created_at: string;
}

export interface StudyGroupMember {
  readonly group_id: string;
  readonly user_id: string;
  readonly joined_at: string;
}

export interface StudyGroupMessage {
  readonly id: string;
  readonly group_id: string;
  readonly user_id: string;
  body: string;
  readonly created_at: string;
}

export interface CollabNote {
  readonly id: string;
  readonly org_id: string | null;
  readonly lesson_id: string;
  content: Record<string, unknown> | null;
  last_updated_by: string | null;
  readonly updated_at: string;
}

export interface MentorshipPair {
  readonly id: string;
  readonly org_id: string | null;
  readonly mentor_id: string;
  readonly mentee_id: string;
  readonly matched_at: string;
  status: 'active' | 'ended';
}

export interface ActivityEvent {
  readonly id: string;
  readonly org_id: string | null;
  readonly user_id: string;
  event_type: string;
  payload: Record<string, unknown> | null;
  readonly created_at: string;
}
