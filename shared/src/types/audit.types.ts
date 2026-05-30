export interface AuditLog {
  readonly id: string;
  readonly org_id: string | null;
  readonly actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  ip_address: string | null;
  readonly created_at: string;
}
