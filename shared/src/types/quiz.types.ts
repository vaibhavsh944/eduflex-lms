export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'drag_drop';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  readonly id: string;
  readonly org_id: string | null;
  readonly course_id: string;
  topic: string | null;
  body: string;
  question_text?: string;
  question_type: QuestionType;
  options: QuestionOption[] | null;
  correct_answer: string | null;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  points?: number;
  readonly created_at: string;
}

export interface Quiz {
  readonly id: string;
  readonly org_id: string | null;
  readonly course_id: string;
  readonly lesson_id: string | null;
  title: string;
  description: string | null;
  time_limit_secs: number | null;
  time_limit_minutes?: number | null;
  max_attempts: number;
  pass_score: number;
  passing_score?: number;
  is_randomized: boolean;
  questions_count: number;
  grace_penalty_pct: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface QuizAttempt {
  readonly id: string;
  readonly org_id: string | null;
  readonly quiz_id: string;
  readonly user_id: string;
  readonly started_at: string;
  submitted_at: string | null;
  score: number | null;
  passed: boolean | null;
  time_spent_secs: number | null;
  is_late: boolean;
  late_penalty_applied: number;
  readonly created_at: string;
}

export interface QuizAnswer {
  readonly id: string;
  readonly attempt_id: string;
  readonly question_id: string;
  answer: string | null;
  is_correct: boolean | null;
  readonly created_at: string;
}

export interface ProctoringFlag {
  readonly id: string;
  readonly attempt_id: string;
  event_type: 'tab_switch' | 'focus_lost' | 'copy_detected';
  readonly flagged_at: string;
}

export type QuizQuestion = Question;

export interface CompetencyRequirement {
  readonly id: string;
  readonly lesson_id: string;
  readonly required_quiz_id: string;
  min_score: number;
}
