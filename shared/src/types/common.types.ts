export interface TimestampFields {
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SoftDeletable extends TimestampFields {
  readonly deleted_at: string | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface RealtimePayload<T> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T>;
}
