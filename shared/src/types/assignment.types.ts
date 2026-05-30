export interface Assignment {
  readonly id: string;
  readonly org_id: string | null;
  readonly course_id: string;
  readonly lesson_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  max_score: number;
  allowed_file_types: string[];
  max_file_size_mb: number;
  peer_review_enabled: boolean;
  peer_review_count: number;
  rubric: Record<string, { description: string; maxPoints: number }> | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface AssignmentSubmission {
  readonly id: string;
  readonly org_id: string | null;
  readonly assignment_id: string;
  readonly user_id: string;
  file_url: string | null;
  file_name: string | null;
  text_content: string | null;
  readonly submitted_at: string;
  is_late: boolean;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
  plagiarism_score: number | null;
  plagiarism_report_url: string | null;
}

export interface PeerReviewAssignment {
  readonly id: string;
  readonly submission_id: string;
  readonly reviewer_id: string;
  status: 'pending' | 'completed';
  score: number | null;
  feedback: string | null;
  rubric_scores: Record<string, number> | null;
  completed_at: string | null;
}

export interface EssayGrade {
  readonly id: string;
  readonly submission_id: string;
  ai_score: Record<string, { score: number; feedback: string }> | null;
  ai_feedback: string | null;
  instructor_override_score: number | null;
  readonly created_at: string;
}

export interface CodeSubmission {
  readonly id: string;
  readonly lesson_id: string;
  readonly user_id: string;
  code: string;
  language: string;
  test_results: Record<string, unknown> | null;
  passed: boolean | null;
  readonly submitted_at: string;
}

export interface ScormPackage {
  readonly id: string;
  readonly lesson_id: string;
  storage_path: string;
  manifest: Record<string, unknown> | null;
  readonly created_at: string;
}
