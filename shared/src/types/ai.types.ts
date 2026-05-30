export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AiConversation {
  readonly id: string;
  readonly user_id: string;
  readonly course_id: string | null;
  readonly lesson_id: string | null;
  messages: ChatMessage[];
  readonly created_at: string;
  readonly updated_at: string;
}

export interface AtRiskFlag {
  readonly id: string;
  readonly user_id: string;
  readonly course_id: string;
  reason: 'low_progress' | 'declining_scores' | 'inactive';
  readonly flagged_at: string;
  resolved: boolean;
  resolved_at: string | null;
}
