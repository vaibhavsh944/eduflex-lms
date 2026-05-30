export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string
          custom_domain: string | null
          saml_domain: string | null
          sso_configured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string
          custom_domain?: string | null
          saml_domain?: string | null
          sso_configured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string
          custom_domain?: string | null
          saml_domain?: string | null
          sso_configured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          org_id: string | null
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'instructor' | 'admin'
          bio: string | null
          headline: string | null
          website_url: string | null
          department_id: string | null
          preferred_language: string
          timezone: string
          push_token: string | null
          referral_code: string | null
          referral_source: string | null
          revenue_split_pct: number
          accessibility_prefs: Json
          notification_prefs: Json
          status: 'active' | 'inactive' | 'deleted'
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          org_id?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
          bio?: string | null
          headline?: string | null
          website_url?: string | null
          department_id?: string | null
          preferred_language?: string
          timezone?: string
          push_token?: string | null
          referral_code?: string | null
          referral_source?: string | null
          revenue_split_pct?: number
          accessibility_prefs?: Json
          notification_prefs?: Json
          status?: 'active' | 'inactive' | 'deleted'
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
          bio?: string | null
          headline?: string | null
          website_url?: string | null
          department_id?: string | null
          preferred_language?: string
          timezone?: string
          push_token?: string | null
          referral_code?: string | null
          referral_source?: string | null
          revenue_split_pct?: number
          accessibility_prefs?: Json
          notification_prefs?: Json
          status?: 'active' | 'inactive' | 'deleted'
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          org_id: string | null
          name: string
          parent_id: string | null
          head_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          name: string
          parent_id?: string | null
          head_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          name?: string
          parent_id?: string | null
          head_user_id?: string | null
          created_at?: string
        }
      }
      semesters: {
        Row: {
          id: string
          org_id: string | null
          name: string
          starts_at: string
          ends_at: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          name: string
          starts_at: string
          ends_at: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          name?: string
          starts_at?: string
          ends_at?: string
          is_active?: boolean
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          org_id: string | null
          instructor_id: string
          semester_id: string | null
          department_id: string | null
          title: string
          slug: string
          description: string | null
          thumbnail_url: string | null
          promo_video_url: string | null
          status: 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected' | 'deleted'
          level: string
          language: string
          category: string | null
          tags: string[] | null
          price: number
          currency: string
          price_type: 'free' | 'paid'
          enrollment_limit: number | null
          certificate_enabled: boolean
          is_drip_content: boolean
          drip_interval_days: number | null
          tax_rate: number
          max_seats: number | null
          is_featured: boolean
          requirements: string[] | null
          learning_outcomes: string[] | null
          content_language: string
          compliance_required: boolean
          hr_email: string | null
          submitted_for_review_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          instructor_id: string
          semester_id?: string | null
          department_id?: string | null
          title: string
          slug: string
          description?: string | null
          thumbnail_url?: string | null
          promo_video_url?: string | null
          status?: 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected' | 'deleted'
          level?: string
          language?: string
          category?: string | null
          tags?: string[] | null
          price?: number
          currency?: string
          price_type?: 'free' | 'paid'
          enrollment_limit?: number | null
          certificate_enabled?: boolean
          is_drip_content?: boolean
          drip_interval_days?: number | null
          tax_rate?: number
          max_seats?: number | null
          is_featured?: boolean
          requirements?: string[] | null
          learning_outcomes?: string[] | null
          content_language?: string
          compliance_required?: boolean
          hr_email?: string | null
          submitted_for_review_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          instructor_id?: string
          semester_id?: string | null
          department_id?: string | null
          title?: string
          slug?: string
          description?: string | null
          thumbnail_url?: string | null
          promo_video_url?: string | null
          status?: 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected' | 'deleted'
          level?: string
          language?: string
          category?: string | null
          tags?: string[] | null
          price?: number
          currency?: string
          price_type?: 'free' | 'paid'
          enrollment_limit?: number | null
          certificate_enabled?: boolean
          is_drip_content?: boolean
          drip_interval_days?: number | null
          tax_rate?: number
          max_seats?: number | null
          is_featured?: boolean
          requirements?: string[] | null
          learning_outcomes?: string[] | null
          content_language?: string
          compliance_required?: boolean
          hr_email?: string | null
          submitted_for_review_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          org_id: string | null
          course_id: string
          title: string
          description: string | null
          position: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          course_id: string
          title: string
          description?: string | null
          position?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          course_id?: string
          title?: string
          description?: string | null
          position?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          org_id: string | null
          module_id: string
          course_id: string
          title: string
          description: string | null
          content_type: 'video' | 'pdf' | 'text' | 'embed'
          content: Json | null
          video_url: string | null
          video_duration: number | null
          pdf_url: string | null
          captions_url: string | null
          embed_url: string | null
          position: number
          is_preview: boolean
          is_published: boolean
          duration_mins: number
          is_free_preview: boolean
          duration_minutes: number | null
          transcript: string | null
          embedding: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          module_id: string
          course_id: string
          title: string
          description?: string | null
          content_type?: 'video' | 'pdf' | 'text' | 'embed'
          content?: Json | null
          video_url?: string | null
          video_duration?: number | null
          pdf_url?: string | null
          captions_url?: string | null
          embed_url?: string | null
          position?: number
          is_preview?: boolean
          is_published?: boolean
          duration_mins?: number
          is_free_preview?: boolean
          duration_minutes?: number | null
          transcript?: string | null
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          module_id?: string
          course_id?: string
          title?: string
          description?: string | null
          content_type?: 'video' | 'pdf' | 'text' | 'embed'
          content?: Json | null
          video_url?: string | null
          video_duration?: number | null
          pdf_url?: string | null
          captions_url?: string | null
          embed_url?: string | null
          position?: number
          is_preview?: boolean
          is_published?: boolean
          duration_mins?: number
          is_free_preview?: boolean
          duration_minutes?: number | null
          transcript?: string | null
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          org_id: string | null
          course_id: string
          lesson_id: string | null
          title: string
          description: string | null
          time_limit_secs: number | null
          max_attempts: number | null
          pass_score: number
          is_randomized: boolean
          questions_count: number
          grace_period_hours: number | null
          grace_penalty_pct: number | null
          randomise_questions: boolean
          randomise_options: boolean
          pick_random_count: number | null
          topic_filter: string | null
          proctoring_enabled: boolean
          show_answers_after: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          course_id: string
          lesson_id?: string | null
          title: string
          description?: string | null
          time_limit_secs?: number | null
          max_attempts?: number | null
          pass_score?: number
          is_randomized?: boolean
          questions_count?: number
          grace_period_hours?: number | null
          grace_penalty_pct?: number | null
          randomise_questions?: boolean
          randomise_options?: boolean
          pick_random_count?: number | null
          topic_filter?: string | null
          proctoring_enabled?: boolean
          show_answers_after?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          course_id?: string
          lesson_id?: string | null
          title?: string
          description?: string | null
          time_limit_secs?: number | null
          max_attempts?: number | null
          pass_score?: number
          is_randomized?: boolean
          questions_count?: number
          grace_period_hours?: number | null
          grace_penalty_pct?: number | null
          randomise_questions?: boolean
          randomise_options?: boolean
          pick_random_count?: number | null
          topic_filter?: string | null
          proctoring_enabled?: boolean
          show_answers_after?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      question_bank: {
        Row: {
          id: string
          org_id: string | null
          course_id: string
          topic: string
          body: string
          question_type: 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'drag_match'
          options: Json | null
          correct_answer: Json | null
          difficulty: 'easy' | 'medium' | 'hard'
          points: number
          explanation: string | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          course_id: string
          topic: string
          body: string
          question_type?: 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'drag_match'
          options?: Json | null
          correct_answer?: Json | null
          difficulty?: 'easy' | 'medium' | 'hard'
          points?: number
          explanation?: string | null
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          course_id?: string
          topic?: string
          body?: string
          question_type?: 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'drag_match'
          options?: Json | null
          correct_answer?: Json | null
          difficulty?: 'easy' | 'medium' | 'hard'
          points?: number
          explanation?: string | null
          usage_count?: number
          created_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          org_id: string | null
          quiz_id: string
          user_id: string
          started_at: string
          submitted_at: string | null
          score: number | null
          passed: boolean | null
          time_spent_secs: number | null
          is_late: boolean
          late_penalty_applied: number
          question_order: Json | null
          option_orders: Json | null
          grace_penalty_pct: number | null
          proctoring_warning_count: number
          auto_submitted: boolean
          instructor_flag: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          quiz_id: string
          user_id: string
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          passed?: boolean | null
          time_spent_secs?: number | null
          is_late?: boolean
          late_penalty_applied?: number
          question_order?: Json | null
          option_orders?: Json | null
          grace_penalty_pct?: number | null
          proctoring_warning_count?: number
          auto_submitted?: boolean
          instructor_flag?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          quiz_id?: string
          user_id?: string
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          passed?: boolean | null
          time_spent_secs?: number | null
          is_late?: boolean
          late_penalty_applied?: number
          question_order?: Json | null
          option_orders?: Json | null
          grace_penalty_pct?: number | null
          proctoring_warning_count?: number
          auto_submitted?: boolean
          instructor_flag?: boolean
          created_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          answer: string | null
          is_correct: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          answer?: string | null
          is_correct?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          answer?: string | null
          is_correct?: boolean | null
          created_at?: string
        }
      }
      proctoring_flags: {
        Row: {
          id: string
          attempt_id: string
          event_type: 'tab_switch' | 'auto_submitted' | 'focus_lost'
          flagged_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          event_type: 'tab_switch' | 'auto_submitted' | 'focus_lost'
          flagged_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          event_type?: 'tab_switch' | 'auto_submitted' | 'focus_lost'
          flagged_at?: string
        }
      }
      competency_requirements: {
        Row: {
          id: string
          lesson_id: string
          required_quiz_id: string
          min_score: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          required_quiz_id: string
          min_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          required_quiz_id?: string
          min_score?: number
          created_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          org_id: string | null
          course_id: string
          lesson_id: string | null
          title: string
          description: string | null
          due_at: string | null
          max_score: number
          allowed_file_types: string[] | null
          max_file_size_mb: number
          peer_review_enabled: boolean
          peer_review_count: number
          rubric: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          course_id: string
          lesson_id?: string | null
          title: string
          description?: string | null
          due_at?: string | null
          max_score?: number
          allowed_file_types?: string[] | null
          max_file_size_mb?: number
          peer_review_enabled?: boolean
          peer_review_count?: number
          rubric?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          course_id?: string
          lesson_id?: string | null
          title?: string
          description?: string | null
          due_at?: string | null
          max_score?: number
          allowed_file_types?: string[] | null
          max_file_size_mb?: number
          peer_review_enabled?: boolean
          peer_review_count?: number
          rubric?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      assignment_submissions: {
        Row: {
          id: string
          org_id: string | null
          assignment_id: string
          user_id: string
          file_url: string | null
          file_name: string | null
          text_content: string | null
          submitted_at: string
          is_late: boolean
          score: number | null
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          plagiarism_score: number | null
          plagiarism_report_url: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          assignment_id: string
          user_id: string
          file_url?: string | null
          file_name?: string | null
          text_content?: string | null
          submitted_at?: string
          is_late?: boolean
          score?: number | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          plagiarism_score?: number | null
          plagiarism_report_url?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          assignment_id?: string
          user_id?: string
          file_url?: string | null
          file_name?: string | null
          text_content?: string | null
          submitted_at?: string
          is_late?: boolean
          score?: number | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          plagiarism_score?: number | null
          plagiarism_report_url?: string | null
        }
      }
      peer_review_assignments: {
        Row: {
          id: string
          submission_id: string
          reviewer_id: string
          status: string
          score: number | null
          feedback: string | null
          rubric_scores: Json | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          submission_id: string
          reviewer_id: string
          status?: string
          score?: number | null
          feedback?: string | null
          rubric_scores?: Json | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          submission_id?: string
          reviewer_id?: string
          status?: string
          score?: number | null
          feedback?: string | null
          rubric_scores?: Json | null
          completed_at?: string | null
        }
      }
      essay_grades: {
        Row: {
          id: string
          submission_id: string
          ai_score: Json | null
          ai_feedback: string | null
          instructor_override_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          ai_score?: Json | null
          ai_feedback?: string | null
          instructor_override_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          ai_score?: Json | null
          ai_feedback?: string | null
          instructor_override_score?: number | null
          created_at?: string
        }
      }
      code_submissions: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          code: string
          language: string
          test_results: Json | null
          passed: boolean | null
          submitted_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          code: string
          language: string
          test_results?: Json | null
          passed?: boolean | null
          submitted_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          code?: string
          language?: string
          test_results?: Json | null
          passed?: boolean | null
          submitted_at?: string
        }
      }
      scorm_packages: {
        Row: {
          id: string
          lesson_id: string
          storage_path: string
          manifest: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          storage_path: string
          manifest?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          storage_path?: string
          manifest?: Json | null
          created_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          org_id: string | null
          user_id: string
          course_id: string
          enrolled_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id: string
          course_id: string
          enrolled_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string
          course_id?: string
          enrolled_at?: string
          expires_at?: string | null
        }
      }
      lesson_progress: {
        Row: {
          id: string
          org_id: string | null
          user_id: string
          lesson_id: string
          course_id: string
          completed: boolean
          completed_at: string | null
          last_position: number
          time_spent_secs: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id: string
          lesson_id: string
          course_id: string
          completed?: boolean
          completed_at?: string | null
          last_position?: number
          time_spent_secs?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string
          lesson_id?: string
          course_id?: string
          completed?: boolean
          completed_at?: string | null
          last_position?: number
          time_spent_secs?: number
          created_at?: string
          updated_at?: string
        }
      }
      waitlists: {
        Row: {
          id: string
          course_id: string
          user_id: string
          position: number
          joined_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          position: number
          joined_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          position?: number
          joined_at?: string
        }
      }
      video_bookmarks: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          timestamp_seconds: number
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          timestamp_seconds: number
          label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          timestamp_seconds?: number
          label?: string | null
          created_at?: string
        }
      }
      downloaded_lessons: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          file_path: string
          downloaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          file_path: string
          downloaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          file_path?: string
          downloaded_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          org_id: string | null
          course_id: string
          user_id: string
          title: string
          body: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          course_id: string
          user_id: string
          title: string
          body: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          course_id?: string
          user_id?: string
          title?: string
          body?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          org_id: string | null
          thread_id: string
          user_id: string
          body: string
          parent_reply_id: string | null
          is_accepted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          thread_id: string
          user_id: string
          body: string
          parent_reply_id?: string | null
          is_accepted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          thread_id?: string
          user_id?: string
          body?: string
          parent_reply_id?: string | null
          is_accepted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      forum_votes: {
        Row: {
          id: string
          user_id: string
          target_id: string
          target_type: string
          value: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_id: string
          target_type: string
          value: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_id?: string
          target_type?: string
          value?: number
          created_at?: string
        }
      }
      lesson_qa: {
        Row: {
          id: string
          org_id: string | null
          lesson_id: string
          user_id: string
          body: string
          is_accepted: boolean
          upvotes: number
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          lesson_id: string
          user_id: string
          body: string
          is_accepted?: boolean
          upvotes?: number
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          lesson_id?: string
          user_id?: string
          body?: string
          is_accepted?: boolean
          upvotes?: number
          created_at?: string
        }
      }
      lesson_qa_replies: {
        Row: {
          id: string
          qa_id: string
          user_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          qa_id: string
          user_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          qa_id?: string
          user_id?: string
          body?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          org_id: string | null
          sender_id: string
          receiver_id: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          sender_id: string
          receiver_id: string
          body: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          sender_id?: string
          receiver_id?: string
          body?: string
          read_at?: string | null
          created_at?: string
        }
      }
      study_groups: {
        Row: {
          id: string
          org_id: string | null
          course_id: string
          name: string
          created_by: string
          max_members: number
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          course_id: string
          name: string
          created_by: string
          max_members?: number
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          course_id?: string
          name?: string
          created_by?: string
          max_members?: number
          created_at?: string
        }
      }
      study_group_members: {
        Row: {
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      study_group_messages: {
        Row: {
          id: string
          group_id: string
          user_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          body?: string
          created_at?: string
        }
      }
      study_group_doc: {
        Row: {
          group_id: string
          content: Json
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          group_id: string
          content?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          group_id?: string
          content?: Json
          updated_by?: string | null
          updated_at?: string
        }
      }
      collab_notes: {
        Row: {
          id: string
          org_id: string | null
          lesson_id: string
          content: Json | null
          last_updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          lesson_id: string
          content?: Json | null
          last_updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          lesson_id?: string
          content?: Json | null
          last_updated_by?: string | null
          updated_at?: string
        }
      }
      mentorship_pairs: {
        Row: {
          id: string
          org_id: string | null
          mentor_id: string
          mentee_id: string
          matched_at: string
          status: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          mentor_id: string
          mentee_id: string
          matched_at?: string
          status?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          mentor_id?: string
          mentee_id?: string
          matched_at?: string
          status?: string
        }
      }
      activity_events: {
        Row: {
          id: string
          org_id: string | null
          user_id: string
          event_type: string
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id: string
          event_type: string
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string
          event_type?: string
          payload?: Json | null
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          org_id: string | null
          name: string
          description: string | null
          icon_url: string | null
          condition: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          name: string
          description?: string | null
          icon_url?: string | null
          condition?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          name?: string
          description?: string | null
          icon_url?: string | null
          condition?: Json | null
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      user_points: {
        Row: {
          user_id: string
          points: number
          last_updated: string
        }
        Insert: {
          user_id: string
          points?: number
          last_updated?: string
        }
        Update: {
          user_id?: string
          points?: number
          last_updated?: string
        }
      }
      user_streaks: {
        Row: {
          user_id: string
          current_streak: number
          longest_streak: number
          last_checkin_date: string | null
        }
        Insert: {
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_checkin_date?: string | null
        }
        Update: {
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_checkin_date?: string | null
        }
      }
      certificates: {
        Row: {
          id: string
          org_id: string | null
          user_id: string
          course_id: string
          pdf_url: string
          issued_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id: string
          course_id: string
          pdf_url: string
          issued_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string
          course_id?: string
          pdf_url?: string
          issued_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          org_id: string | null
          user_id: string
          course_id: string
          order_id: string
          razorpay_payment_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          coupon_id: string | null
          discount_applied: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id: string
          course_id: string
          order_id: string
          razorpay_payment_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          coupon_id?: string | null
          discount_applied?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string
          course_id?: string
          order_id?: string
          razorpay_payment_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          coupon_id?: string | null
          discount_applied?: number
          created_at?: string
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          org_id: string | null
          code: string
          discount_type: 'percentage' | 'flat'
          discount_value: number
          max_uses: number | null
          used_count: number
          expires_at: string | null
          course_id: string | null
          min_order_value: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          code: string
          discount_type: 'percentage' | 'flat'
          discount_value: number
          max_uses?: number | null
          used_count?: number
          expires_at?: string | null
          course_id?: string | null
          min_order_value?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          code?: string
          discount_type?: 'percentage' | 'flat'
          discount_value?: number
          max_uses?: number | null
          used_count?: number
          expires_at?: string | null
          course_id?: string | null
          min_order_value?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      coupon_uses: {
        Row: {
          id: string
          coupon_id: string
          user_id: string
          order_id: string
          applied_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          user_id: string
          order_id: string
          applied_at?: string
        }
        Update: {
          id?: string
          coupon_id?: string
          user_id?: string
          order_id?: string
          applied_at?: string
        }
      }
      instructor_earnings: {
        Row: {
          id: string
          instructor_id: string
          course_id: string
          payment_id: string
          gross_amount: number
          platform_cut: number
          instructor_amount: number
          payout_status: 'pending' | 'paid' | 'cancelled'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          course_id: string
          payment_id: string
          gross_amount: number
          platform_cut: number
          instructor_amount: number
          payout_status?: 'pending' | 'paid' | 'cancelled'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          course_id?: string
          payment_id?: string
          gross_amount?: number
          platform_cut?: number
          instructor_amount?: number
          payout_status?: 'pending' | 'paid' | 'cancelled'
          paid_at?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          payment_id: string
          user_id: string
          invoice_number: string
          pdf_url: string
          tax_amount: number
          issued_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          user_id: string
          invoice_number: string
          pdf_url: string
          tax_amount?: number
          issued_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          user_id?: string
          invoice_number?: string
          pdf_url?: string
          tax_amount?: number
          issued_at?: string
        }
      }
      user_credits: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string | null
          expires_at: string | null
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason?: string | null
          expires_at?: string | null
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string | null
          expires_at?: string | null
          used?: boolean
          created_at?: string
        }
      }
      referral_conversions: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          course_id: string | null
          reward_type: string | null
          reward_value: number | null
          converted_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          course_id?: string | null
          reward_type?: string | null
          reward_value?: number | null
          converted_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          course_id?: string | null
          reward_type?: string | null
          reward_value?: number | null
          converted_at?: string
        }
      }
      live_sessions: {
        Row: {
          id: string
          org_id: string | null
          course_id: string
          instructor_id: string
          title: string
          daily_room_url: string | null
          recording_url: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          course_id: string
          instructor_id: string
          title: string
          daily_room_url?: string | null
          recording_url?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          course_id?: string
          instructor_id?: string
          title?: string
          daily_room_url?: string | null
          recording_url?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
      }
      live_polls: {
        Row: {
          id: string
          session_id: string
          question: string
          options: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question: string
          options: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question?: string
          options?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      live_poll_responses: {
        Row: {
          poll_id: string
          user_id: string
          chosen_option: number
          created_at: string
        }
        Insert: {
          poll_id: string
          user_id: string
          chosen_option: number
          created_at?: string
        }
        Update: {
          poll_id?: string
          user_id?: string
          chosen_option?: number
          created_at?: string
        }
      }
      office_hour_slots: {
        Row: {
          id: string
          instructor_id: string
          starts_at: string
          ends_at: string
          is_booked: boolean
          student_id: string | null
          booked_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          starts_at: string
          ends_at: string
          is_booked?: boolean
          student_id?: string | null
          booked_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          starts_at?: string
          ends_at?: string
          is_booked?: boolean
          student_id?: string | null
          booked_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          org_id: string | null
          user_id: string
          type: string
          message: string
          payload: Json | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id: string
          type: string
          message: string
          payload?: Json | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string
          type?: string
          message?: string
          payload?: Json | null
          read_at?: string | null
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          org_id: string | null
          author_id: string | null
          course_id: string | null
          target_role: string | null
          title: string
          body: string
          scheduled_at: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          author_id?: string | null
          course_id?: string | null
          target_role?: string | null
          title: string
          body: string
          scheduled_at?: string | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          author_id?: string | null
          course_id?: string | null
          target_role?: string | null
          title?: string
          body?: string
          scheduled_at?: string | null
          published_at?: string | null
          created_at?: string
        }
      }
      course_reviews: {
        Row: {
          id: string
          course_id: string
          user_id: string
          rating: number
          body: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          rating: number
          body?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          rating?: number
          body?: string | null
          created_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          lesson_id: string | null
          messages: Json
          cleared_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          lesson_id?: string | null
          messages?: Json
          cleared_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          lesson_id?: string | null
          messages?: Json
          cleared_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      at_risk_flags: {
        Row: {
          id: string
          user_id: string
          course_id: string
          reason: string
          flagged_at: string
          resolved: boolean
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          reason: string
          flagged_at?: string
          resolved?: boolean
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          reason?: string
          flagged_at?: string
          resolved?: boolean
          resolved_at?: string | null
        }
      }
      rate_limits: {
        Row: {
          key: string
          count: number
          window_end: string
          created_at: string
        }
        Insert: {
          key: string
          count?: number
          window_end: string
          created_at?: string
        }
        Update: {
          key?: string
          count?: number
          window_end?: string
          created_at?: string
        }
      }
      user_integrations: {
        Row: {
          id: string
          user_id: string
          provider: 'google_calendar' | 'google_drive' | 'slack' | 'discord'
          access_token_enc: string
          refresh_token_enc: string | null
          scopes: string[] | null
          connected_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'google_calendar' | 'google_drive' | 'slack' | 'discord'
          access_token_enc: string
          refresh_token_enc?: string | null
          scopes?: string[] | null
          connected_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'google_calendar' | 'google_drive' | 'slack' | 'discord'
          access_token_enc?: string
          refresh_token_enc?: string | null
          scopes?: string[] | null
          connected_at?: string
        }
      }
      webhook_subscriptions: {
        Row: {
          id: string
          org_id: string
          url: string
          events: string[]
          secret_hash: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          url: string
          events: string[]
          secret_hash: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          url?: string
          events?: string[]
          secret_hash?: string
          is_active?: boolean
          created_at?: string
        }
      }
      webhook_deliveries: {
        Row: {
          id: string
          subscription_id: string
          event_type: string
          payload: Json
          status_code: number | null
          response_body: string | null
          delivered_at: string | null
          next_retry_at: string | null
          attempt_count: number
          status: 'pending' | 'success' | 'failed'
        }
        Insert: {
          id?: string
          subscription_id: string
          event_type: string
          payload: Json
          status_code?: number | null
          response_body?: string | null
          delivered_at?: string | null
          next_retry_at?: string | null
          attempt_count?: number
          status?: 'pending' | 'success' | 'failed'
        }
        Update: {
          id?: string
          subscription_id?: string
          event_type?: string
          payload?: Json
          status_code?: number | null
          response_body?: string | null
          delivered_at?: string | null
          next_retry_at?: string | null
          attempt_count?: number
          status?: 'pending' | 'success' | 'failed'
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          actor_email: string | null
          action_type: string
          target_type: string | null
          target_id: string | null
          target_name: string | null
          details: Json
          ip_address: string | null
          impersonated_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          actor_email?: string | null
          action_type: string
          target_type?: string | null
          target_id?: string | null
          target_name?: string | null
          details?: Json
          ip_address?: string | null
          impersonated_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          actor_email?: string | null
          action_type?: string
          target_type?: string | null
          target_id?: string | null
          target_name?: string | null
          details?: Json
          ip_address?: string | null
          impersonated_by?: string | null
          created_at?: string
        }
      }
      compliance_courses: {
        Row: {
          id: string
          course_id: string
          org_id: string | null
          target_role: string | null
          compliance_deadline: string | null
          hr_email: string | null
        }
        Insert: {
          id?: string
          course_id: string
          org_id?: string | null
          target_role?: string | null
          compliance_deadline?: string | null
          hr_email?: string | null
        }
        Update: {
          id?: string
          course_id?: string
          org_id?: string | null
          target_role?: string | null
          compliance_deadline?: string | null
          hr_email?: string | null
        }
      }
      rubric_criteria: {
        Row: {
          id: string
          assignment_id: string | null
          title: string
          description: string | null
          max_points: number
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          assignment_id?: string | null
          title: string
          description?: string | null
          max_points?: number
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string | null
          title?: string
          description?: string | null
          max_points?: number
          position?: number
          created_at?: string
        }
      }
      rubric_scores: {
        Row: {
          id: string
          submission_id: string
          criterion_id: string
          score: number
          comment: string | null
        }
        Insert: {
          id?: string
          submission_id: string
          criterion_id: string
          score: number
          comment?: string | null
        }
        Update: {
          id?: string
          submission_id?: string
          criterion_id?: string
          score?: number
          comment?: string | null
        }
      }
      impersonation_sessions: {
        Row: {
          id: string
          admin_id: string
          impersonated_user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          impersonated_user_id: string
          token: string
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          impersonated_user_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
      ai_usage: {
        Row: {
          id: string
          user_id: string | null
          feature: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          feature: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          feature?: string
          metadata?: Json
          created_at?: string
        }
      }
      ai_usage_log: {
        Row: {
          id: string
          user_id: string | null
          feature: string
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          feature: string
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          feature?: string
          tokens_used?: number | null
          created_at?: string
        }
      }
      lesson_summaries: {
        Row: {
          id: string
          lesson_id: string
          summary: string
          generated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          summary: string
          generated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          summary?: string
          generated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      courses_search_vector: {
        Args: {
          title: string
          description: string
        }
        Returns: string
      }
    }
    Enums: {
      user_role: 'student' | 'instructor' | 'admin'
      content_status: 'draft' | 'published' | 'archived' | 'under_review'
      lesson_content_type: 'video' | 'pdf' | 'text' | 'code' | 'math' | 'scorm' | 'h5p' | 'embed'
      question_type: 'mcq' | 'true_false' | 'short_answer' | 'drag_drop'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      payout_status: 'pending' | 'paid' | 'cancelled'
      notification_type: 'new_message' | 'grade_posted' | 'assignment_due' | 'quiz_due' | 'course_announcement' | 'forum_reply' | 'waitlist_enrolled' | 'certificate_issued' | 'badge_earned' | 'live_session_starting' | 'office_hours_booked' | 'compliance_reminder' | 'at_risk_flag'
      delivery_status: 'pending' | 'success' | 'failed'
      integration_provider: 'google_calendar' | 'google_drive' | 'slack' | 'discord'
      discount_type: 'percentage' | 'flat'
      conflict_resolution: 'server_wins' | 'latest_wins' | 'client_wins'
    }
  }
}
