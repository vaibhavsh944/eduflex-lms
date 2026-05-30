export interface LiveSession {
  readonly id: string;
  readonly org_id: string | null;
  readonly course_id: string;
  readonly instructor_id: string;
  title: string;
  daily_room_url: string | null;
  recording_url: string | null;
  started_at: string | null;
  ended_at: string | null;
  readonly created_at: string;
}

export interface LivePoll {
  readonly id: string;
  readonly session_id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  is_active: boolean;
  readonly created_at: string;
}

export interface LivePollResponse {
  readonly poll_id: string;
  readonly user_id: string;
  chosen_option: number;
  readonly created_at: string;
}

export interface OfficeHourSlot {
  readonly id: string;
  readonly instructor_id: string;
  starts_at: string;
  ends_at: string;
  is_booked: boolean;
  student_id: string | null;
  booked_at: string | null;
  readonly created_at: string;
}
