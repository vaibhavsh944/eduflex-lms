export interface Organization {
  readonly id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  custom_domain: string | null;
  saml_domain: string | null;
  sso_configured: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Semester {
  readonly id: string;
  readonly org_id: string | null;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  readonly created_at: string;
}

export interface Department {
  readonly id: string;
  readonly org_id: string | null;
  name: string;
  parent_id: string | null;
  head_user_id: string | null;
  children?: Department[];
  readonly created_at: string;
}
