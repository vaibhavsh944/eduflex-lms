export interface Certificate {
  readonly id: string;
  readonly org_id: string | null;
  readonly user_id: string;
  readonly course_id: string;
  pdf_url: string;
  certificate_url?: string | null;
  course?: Record<string, unknown>;
  readonly issued_at: string;
}
