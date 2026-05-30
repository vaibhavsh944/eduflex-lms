export type IntegrationProvider = 'google_calendar' | 'google_drive' | 'slack' | 'discord';

export interface UserIntegration {
  readonly id: string;
  readonly user_id: string;
  provider: IntegrationProvider;
  access_token_enc: string;
  refresh_token_enc: string | null;
  scopes: string[];
  readonly connected_at: string;
}

export interface WebhookSubscription {
  readonly id: string;
  readonly org_id: string;
  url: string;
  events: string[];
  secret_hash: string;
  is_active: boolean;
  readonly created_at: string;
}

export type DeliveryStatus = 'pending' | 'success' | 'failed';

export interface WebhookDelivery {
  readonly id: string;
  readonly subscription_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status_code: number | null;
  response_body: string | null;
  delivered_at: string | null;
  next_retry_at: string | null;
  attempt_count: number;
  status: DeliveryStatus;
}

export interface ComplianceCourse {
  readonly id: string;
  readonly course_id: string;
  readonly org_id: string | null;
  target_role: import('./user.types').UserRole | null;
  compliance_deadline: string | null;
  hr_email: string | null;
}
