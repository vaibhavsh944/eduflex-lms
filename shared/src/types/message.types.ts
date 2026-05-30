export interface Message {
  readonly id: string;
  readonly org_id: string | null;
  readonly sender_id: string;
  readonly receiver_id: string;
  body: string;
  read_at: string | null;
  readonly created_at: string;
}
