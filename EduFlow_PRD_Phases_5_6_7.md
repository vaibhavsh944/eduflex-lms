# EduFlow LMS — Combined Product Requirements Document
## Phases 5, 6 & 7: Instructor Features · Admin Features · AI Core

**Version:** 1.0  
**Scope:** Phases 5–7 of the EduFlow master build plan (v2)  
**Prerequisite:** Phases 0–4 fully deployed and stable (Foundation, Auth, Public Pages, Student Core, Student Extended)  
**Estimated Duration:** 9–11 working days  
**Target Audience:** Antigravity AI agents performing autonomous full-stack implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Pre-Build Checklist](#2-pre-build-checklist)
3. [Phase 5 — Instructor Features](#3-phase-5--instructor-features)
4. [Phase 6 — Admin Features](#4-phase-6--admin-features)
5. [Phase 7 — AI Core Features](#5-phase-7--ai-core-features)
6. [Cross-Phase Database Architecture](#6-cross-phase-database-architecture)
7. [Cross-Phase Edge Functions](#7-cross-phase-edge-functions)
8. [Routing Architecture (All New Routes)](#8-routing-architecture-all-new-routes)
9. [State Management](#9-state-management)
10. [Security & RLS Policies](#10-security--rls-policies)
11. [Component Library Additions](#11-component-library-additions)
12. [Error Handling & Loading States](#12-error-handling--loading-states)
13. [Testing Requirements](#13-testing-requirements)
14. [Critical Implementation Rules](#14-critical-implementation-rules)
15. [Acceptance Criteria](#15-acceptance-criteria)

---

## 1. Executive Summary

Phases 5–7 build the **instructor-facing course management system**, the **administrator control panel**, and the **AI-powered learning features** on top of the student-complete foundation from Phases 0–4.

| Phase | Title | Duration | Pages Added | Key Output |
|-------|-------|----------|-------------|------------|
| 5 | Instructor Features | 3–4 days | 6 new routes | Full course creation, grading, analytics |
| 6 | Admin Features | 3–4 days | 6 new routes | User management, platform analytics, audit log |
| 7 | AI Core | 2–3 days | 0 new routes (3 drawers/overlays) | AI Tutor, Quiz Generator, Lesson Summarizer |

**Technology additions in this block:**
- `dnd-kit` — drag-and-drop for module/lesson reorder and quiz builder
- `TipTap v2` — rich text editing for lesson content, assignments, and announcements
- `Anthropic SDK` (`claude-sonnet-4-5`) — via Supabase Edge Functions only
- Server-Sent Events (SSE) via `ReadableStream` in Edge Functions for AI streaming
- `useStream` custom hook — consumes SSE on the frontend

---

## 2. Pre-Build Checklist

Before writing any code for Phase 5, confirm all of the following:

- [ ] `profiles` table has `role` column with values `student | instructor | admin`
- [ ] `RoleGuard` component exists and correctly redirects non-instructors away from `/instructor/*`
- [ ] `RoleGuard` correctly redirects non-admins away from `/admin/*`
- [ ] Supabase Storage bucket `course-thumbnails` exists and is public-read
- [ ] Supabase Storage bucket `lesson-videos` exists with RLS (only owner can upload)
- [ ] Supabase Storage bucket `lesson-pdfs` exists with RLS
- [ ] Supabase Storage bucket `assignment-submissions` exists (private, student-owned rows only)
- [ ] `tus` resumable upload is confirmed working for files > 50MB
- [ ] `courses`, `modules`, `lessons`, `quizzes`, `questions`, `quiz_attempts`, `assignments`, `submissions` tables exist from Phase 3
- [ ] All 60+ routes already stubbed in the router (no dead ends)
- [ ] `InstructorLayout` and `AdminLayout` components exist as shells
- [ ] `ANTHROPIC_API_KEY` is set in Supabase Edge Function secrets (NOT in `.env` on frontend)
- [ ] `dnd-kit`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@anthropic-ai/sdk` are installed

---

## 3. Phase 5 — Instructor Features

### 3.1 Overview

**Goal:** A logged-in user with role `instructor` can create and fully manage courses end-to-end: write rich-text lessons, upload videos, build quizzes, define assignments with rubrics, grade student submissions, and view deep analytics on their course's performance.

**New Pages:**

| Route | Component | Description |
|-------|-----------|-------------|
| `/instructor` | `InstructorDashboardPage` | KPI summary + charts + quick actions |
| `/instructor/courses` | `InstructorCoursesPage` | List of own courses with status + stats |
| `/instructor/courses/new` | `NewCoursePage` | 3-step wizard to create a course |
| `/instructor/courses/:courseId/edit` | `CourseBuilderPage` | Curriculum + settings management |
| `/instructor/courses/:courseId/analytics` | `CourseAnalyticsPage` | Completion funnel, quiz scores, drop-off |
| `/instructor/gradebook` | `GradebookPage` | All submissions across all courses |

---

### 3.2 InstructorDashboardPage (`/instructor`)

**Layout:** Uses `InstructorLayout` (sidebar + topbar). Sidebar links: Dashboard, My Courses, Gradebook.

**Sections to render:**

#### 3.2.1 KPI Cards Row
Four stat cards across the top:
- **Total Students** — count of distinct `user_id` from `enrollments` where course `instructor_id = auth.uid()`
- **Active Courses** — count of courses with `status = 'published'`
- **Avg Completion Rate** — average `(completed_lessons / total_lessons) * 100` across all enrollments
- **Total Revenue** — sum of `payments.amount` for courses owned by this instructor (Phase 9 data; show `—` if payments table not yet seeded)

Each card: icon, label, value, percentage change vs. last 30 days (subtle subtext). Use skeleton loader matching card shape while loading.

#### 3.2.2 Enrollment Trend Chart
- `Recharts` `AreaChart`
- X-axis: last 30 days (daily)
- Y-axis: new enrollments per day
- Data source: `SELECT date_trunc('day', created_at), count(*) FROM enrollments WHERE course_id IN (instructor's courses) GROUP BY 1 ORDER BY 1`
- Color: brand indigo with 20% opacity fill

#### 3.2.3 Student Completion Rates (per course)
- `Recharts` `BarChart` — horizontal bars
- Each bar = one published course
- Value = average completion % across enrolled students
- Clicking a bar navigates to `/instructor/courses/:courseId/analytics`

#### 3.2.4 Recent Activity Feed
- Latest 10 events: new enrollment, quiz submission, assignment submission, grade override
- Each row: avatar, student name, action, course name, timestamp (relative)
- Data from: join `enrollments + quiz_attempts + submissions` ordered by `created_at DESC LIMIT 10`

#### 3.2.5 Quick Actions
Three buttons: `+ New Course`, `Go to Gradebook`, `View Analytics`.

---

### 3.3 InstructorCoursesPage (`/instructor/courses`)

**Purpose:** Overview of all courses this instructor owns.

**Table columns:** Thumbnail · Title · Status (Draft/Published/Archived) · Students · Avg Score · Revenue · Actions

**Status badges:**
- `Draft` → grey badge
- `Published` → green badge
- `Archived` → yellow badge

**Actions column per row:**
- `Edit` → `/instructor/courses/:id/edit`
- `Analytics` → `/instructor/courses/:id/analytics`
- `Publish` (only if Draft) → `PATCH courses SET status='published'` — confirm dialog required
- `Archive` → confirm dialog, `PATCH courses SET status='archived'`

**Search bar:** debounced (300ms) `ILIKE %query%` on course title.

**Empty state:** "You haven't created any courses yet. Start by clicking + New Course."

**`+ New Course` button:** navigates to `/instructor/courses/new`

---

### 3.4 NewCoursePage (`/instructor/courses/new`) — 3-Step Wizard

A step indicator at the top shows Step 1 / 2 / 3. Each step validates before allowing progression.

#### Step 1: Course Details

**Form fields (all via React Hook Form + Zod):**

| Field | Type | Validation |
|-------|------|------------|
| `title` | Text input | Required, 5–120 chars |
| `short_description` | Textarea | Required, 20–200 chars |
| `description` | TipTap rich text | Required, min 50 chars (strip HTML for count) |
| `category` | Select dropdown | Required. Options: Technology, Business, Design, Marketing, Personal Development, Science, Language, Other |
| `difficulty` | Radio group | Beginner / Intermediate / Advanced |
| `language` | Select | Default: English. Options: English, Hindi, Spanish, French, German |
| `thumbnail` | Image upload (drag-and-drop) | Required. Max 5MB. JPG/PNG only. Preview shown. Uploads to `course-thumbnails` bucket on save. |
| `promo_video_url` | URL input | Optional. Must be a valid URL (YouTube/Vimeo/direct MP4) |
| `tags` | Tag input (comma-separated) | Optional, max 10 tags, max 30 chars each |

On "Next", validate all fields. If invalid, highlight errors inline. Do NOT navigate forward.

#### Step 2: Pricing & Settings

| Field | Type | Validation |
|-------|------|------------|
| `price_type` | Radio | Free / Paid |
| `price` | Number input | Required if Paid. Min 0. Max 99999. Currency: INR (Razorpay). Hidden if Free. |
| `enrollment_limit` | Number input | Optional. Leave blank for unlimited. |
| `certificate_enabled` | Toggle | Default ON |
| `is_drip_content` | Toggle | Default OFF. If ON, show drip interval field. |
| `drip_interval_days` | Number | Required if drip ON. Min 1, Max 365. |

#### Step 3: Review & Create

- Read-only summary of all fields entered
- "Create Course (Draft)" button
- On submit: `INSERT courses` with all fields + `status='draft'` + `instructor_id = auth.uid()`
- On success: redirect to `/instructor/courses/:newId/edit`
- Show toast: "Course created! Now add your curriculum."

---

### 3.5 CourseBuilderPage (`/instructor/courses/:courseId/edit`)

This is the most complex page in Phase 5. It is a **tabbed interface** with three tabs: **Curriculum**, **Settings**, **Preview**.

#### 3.5.1 Curriculum Tab

**Left panel (1/3 width):** Module + Lesson tree  
**Right panel (2/3 width):** Editor for selected item

**Module/Lesson Tree:**

- Modules listed vertically. Each module is expandable (show lessons).
- **Drag-and-drop reorder** using `dnd-kit` `SortableContext`:
  - Modules can be reordered relative to each other
  - Lessons within a module can be reordered
  - Drop a lesson between modules to move it
  - On drop, `PATCH modules SET position = X` and `PATCH lessons SET position = X, module_id = Y`
- Each module row: drag handle icon · module title · lesson count · expand chevron · Edit · Delete
- Each lesson row (nested): drag handle · lesson type icon · lesson title · duration · Edit · Delete
- `+ Add Module` button at bottom of tree
- `+ Add Lesson` button inside each expanded module

**Module creation inline:**
- Click `+ Add Module` → inline text input appears at bottom of tree
- Type name, press Enter or click ✓ to save → `INSERT modules (course_id, title, position)`
- Press Esc to cancel

**Lesson Editor Panel (right panel):**

When a lesson is selected from the tree (or newly created), the right panel shows:

**LessonEditor component** with these fields:

| Field | Details |
|-------|---------|
| `title` | Text input, required |
| `content_type` | Segmented control: `Video` · `PDF` · `Text` · `Free Preview` flag |
| `is_free_preview` | Toggle — this lesson is visible without enrollment |
| `duration_minutes` | Number input — estimated duration (manually entered) |

**If `content_type = 'Video'`:**
- Drag-and-drop video upload zone
- Accepted formats: MP4, MOV, AVI, WebM
- Max size shown as hint: "Up to 2GB supported"
- **Upload MUST use tus resumable protocol** via `supabase.storage.from('lesson-videos').createSignedUploadUrl({ upsert: true })` combined with `tus-js-client`
- Progress bar shown during upload (percentage)
- On upload complete: `UPDATE lessons SET video_url = signed_url`
- Thumbnail auto-generated from video via Supabase Storage transform (append `?width=320` to URL for preview)
- `Text content` (TipTap editor) still available below video for supplementary notes

**If `content_type = 'PDF'`:**
- PDF upload zone. Max 50MB. Uploads to `lesson-pdfs` bucket.
- On upload complete: `UPDATE lessons SET pdf_url = signed_url`
- Optional TipTap text content below

**If `content_type = 'Text'`:**
- Full TipTap v2 editor with toolbar: Bold, Italic, Underline, Strikethrough, H1, H2, H3, Bullet list, Ordered list, Code block, Quote, Link, Image (uploads to `lesson-images` storage bucket), Undo, Redo
- Character count shown in bottom-right of editor

**TipTap configuration:**
```typescript
// Extensions required for LessonEditor
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
```

**Auto-save:** Lesson content auto-saves 2 seconds after the user stops typing (debounced `PATCH lessons`). Show "Saving…" → "Saved ✓" indicator in the top-right of the editor.

**Quiz Builder (accessed from lesson tree or from lesson editor "Add Quiz" button):**

Navigates to a `QuizBuilderDrawer` (right-panel overlay) with:

- `title` — text input
- `time_limit_minutes` — number (0 = no limit)
- `passing_score_pct` — number (0–100, default 70)
- `max_attempts` — number (0 = unlimited)
- `randomize_questions` — toggle
- `randomize_answers` — toggle
- Question list with `dnd-kit` reorder
- `+ Add Question` button → `QuestionEditor`:
  - `question_type`: MCQ / True-False / Short Answer
  - `body` — TipTap single-line
  - `points` — number (default 1)
  - If MCQ: add/remove answer options, mark correct option(s) (single or multiple correct supported)
  - If True-False: radio (True/False is the correct answer)
  - If Short Answer: `sample_answer` text field for instructor reference (not shown to student)
  - `explanation` (optional) — shown after quiz submission
- Save quiz → `INSERT quizzes` + `INSERT questions` (bulk)

**Assignment Builder (accessed from lesson tree):**

`AssignmentBuilderDrawer` with:

| Field | Details |
|-------|---------|
| `title` | Text input, required |
| `instructions` | TipTap rich text editor |
| `due_date` | Date-time picker (timezone-aware, stored as UTC) |
| `max_score` | Number, default 100 |
| `allowed_file_types` | Multi-select: PDF, DOCX, ZIP, Image, Any |
| `max_file_size_mb` | Number, default 10, max 100 |
| `allow_text_submission` | Toggle — student can paste text instead of uploading |
| `grace_period_hours` | Number — late submission window (Phase 13 full proctoring; here just store the field) |

**Rubric Builder** (optional, inside AssignmentBuilderDrawer):
- Toggle "Use rubric grading"
- If enabled: table of criteria rows (criterion name, max points, description)
- `dnd-kit` reorder of criteria rows
- Total max points auto-sum shown

---

#### 3.5.2 Settings Tab

Displays the same fields from the wizard (Steps 1 and 2) in editable form. Auto-save on field blur. Any change to `status` (Publish/Unpublish) requires a confirmation dialog.

**Danger Zone section** (bottom, red border):
- Delete Course button — double confirm dialog: "Type the course title to confirm deletion"
- On confirm: `DELETE courses WHERE id = :id AND instructor_id = auth.uid()` (cascade deletes modules, lessons, quizzes, etc. via DB foreign key cascade)

#### 3.5.3 Preview Tab

- Renders the course exactly as a student would see it on `/catalog/:courseId`
- Read-only iframe-like view using existing `CourseDetailPage` components in preview mode
- "Open student view in new tab" link

---

### 3.6 CourseAnalyticsPage (`/instructor/courses/:courseId/analytics`)

**Header:** Course title, status badge, total enrolled students, last updated timestamp.

#### 3.6.1 Completion Funnel (Recharts FunnelChart or BarChart)
- Each bar = one module
- Value = % of enrolled students who completed all lessons in that module
- Bars descend left to right — shows where students drop off
- Hover tooltip shows exact completion count + percentage

#### 3.6.2 Avg Quiz Score Per Lesson (Recharts LineChart)
- X-axis: quiz associated lessons in order
- Y-axis: 0–100 avg score
- Reference line at 70% (passing threshold, configurable)

#### 3.6.3 Student-Level Table (bottom)
Columns: Student Name · Enrolled Date · % Complete · Last Active · Avg Quiz Score · Assignments Submitted · Grade (overall)

- Sortable columns (click header)
- Search by student name
- Click student row → opens a `StudentProgressDrawer` with detailed lesson-by-lesson breakdown
- Export CSV button (generates client-side CSV from current filtered data using `papaparse` or manual string building)

#### 3.6.4 Drop-off Heatmap
- Grid: rows = students (first 50), columns = lessons in order
- Cell colour: green (completed) / red (not completed) / yellow (in-progress)
- Hovering a cell shows: student name, lesson title, last_accessed timestamp

---

### 3.7 GradebookPage (`/instructor/gradebook`)

**Purpose:** Single page to review and grade all student assignment submissions across all the instructor's courses.

**Filter bar:** Filter by Course (dropdown), Filter by Status (Pending / Graded / All), Search by student name.

**Table columns:** Student · Course · Assignment · Submitted At · Status · Score · Feedback · Actions

**Actions column:**
- If `status = 'pending'`: `Grade` button → opens `GradingDrawer`
- If `status = 'graded'`: `Edit Grade` button → reopens `GradingDrawer`

**GradingDrawer (right-side panel, not a modal):**

Layout:
- Left side: Submission viewer
  - If text submission: rendered HTML
  - If file submission: PDF embed if PDF, download link otherwise
- Right side: Grading form
  - If rubric: criterion rows each with a score input (max shown per criterion), auto-summing total
  - If no rubric: single `score` input (0 to `max_score`)
  - `feedback` — TipTap editor (instructor writes rich feedback)
  - `Submit Grade` button → `UPSERT submissions SET score, feedback, graded_at = now(), graded_by = auth.uid()`
  - On save: trigger notification INSERT for the student (`type = 'assignment_graded'`)
  - Show "Grade saved ✓" toast

**Plagiarism column** (display only for now — full integration Phase 16): show `—` placeholder.

**Batch grade override:** Checkbox column to select multiple graded submissions → "Bulk Adjust Score" button adds/subtracts N points to all selected. Confirmation required.

**CSV Export:** Downloads all graded+pending data as CSV including student email, score, feedback.

---

### 3.8 Supabase Work (Phase 5)

#### New/Modified Tables

```sql
-- Modifications to existing tables (add columns if not already present)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'free' CHECK (price_type IN ('free', 'paid'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_limit INTEGER; -- NULL = unlimited
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_drip_content BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drip_interval_days INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS promo_video_url TEXT;

ALTER TABLE modules ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text' CHECK (content_type IN ('video','pdf','text','embed'));

-- Rubric tables
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  max_points NUMERIC(6,2) NOT NULL DEFAULT 10,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rubric_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  criterion_id UUID REFERENCES rubric_criteria(id) ON DELETE CASCADE,
  score NUMERIC(6,2) NOT NULL,
  comment TEXT,
  UNIQUE(submission_id, criterion_id)
);

-- Assignment modifications
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS graded_by UUID REFERENCES profiles(id);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS feedback TEXT; -- plain or HTML
```

#### RLS Policies (Phase 5 additions)

```sql
-- rubric_criteria: instructors manage their own, students can read for enrolled courses
CREATE POLICY "Instructor manages rubric_criteria" ON rubric_criteria
  FOR ALL USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN lessons l ON l.id = a.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students read rubric_criteria for enrolled courses" ON rubric_criteria
  FOR SELECT USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN lessons l ON l.id = a.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      JOIN enrollments e ON e.course_id = c.id AND e.user_id = auth.uid()
    )
  );

-- rubric_scores
CREATE POLICY "Instructor manages rubric_scores" ON rubric_scores
  FOR ALL USING (
    criterion_id IN (
      SELECT rc.id FROM rubric_criteria rc
      JOIN assignments a ON a.id = rc.assignment_id
      JOIN lessons l ON l.id = a.lesson_id
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students read own rubric_scores" ON rubric_scores
  FOR SELECT USING (
    submission_id IN (SELECT id FROM submissions WHERE student_id = auth.uid())
  );
```

#### Edge Functions (Phase 5)

**`/instructor/reorder-lessons`** (POST)
```
Body: { lessons: [{ id, position, module_id }] }
Auth: instructor only (check instructor_id on each lesson's course)
Action: UPDATE lessons SET position = ?, module_id = ? for each item in a transaction
Returns: { success: true }
```

**`/instructor/publish-course`** (POST)
```
Body: { course_id }
Auth: instructor only (must own the course)
Validation: course must have ≥1 module, ≥1 published lesson
Action: UPDATE courses SET status = 'published', published_at = now()
Returns: { success: true } | { error: 'validation message' }
```

---

## 4. Phase 6 — Admin Features

### 4.1 Overview

**Goal:** An `admin`-role user has complete oversight of the entire EduFlow platform — managing users, overseeing courses, publishing system-wide announcements, viewing global analytics, and reviewing every admin action in an immutable audit log.

**New Pages:**

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `AdminDashboardPage` | Platform-wide KPIs + charts |
| `/admin/users` | `UserManagementPage` | Full user CRUD with bulk actions |
| `/admin/courses` | `AdminCoursesPage` | Oversee and moderate all courses |
| `/admin/announcements` | `AnnouncementsPage` | Compose + send platform-wide announcements |
| `/admin/analytics` | `PlatformAnalyticsPage` | Platform-wide analytics |
| `/admin/audit-log` | `AuditLogPage` | Immutable log of all admin actions |

> **CRITICAL:** Every database query in admin pages that touches user PII, role changes, or course moderation MUST go through a Supabase **Edge Function** that uses the `service_role` key. The `service_role` key is **never** exposed to the browser. All admin Edge Functions must first verify `auth.uid()` maps to a profile with `role = 'admin'`.

---

### 4.2 AdminDashboardPage (`/admin`)

**Layout:** `AdminLayout`. Sidebar links: Dashboard, Users, Courses, Announcements, Analytics, Audit Log.

#### 4.2.1 KPI Cards (top row, 4 cards)
- **Total Users** — `SELECT count(*) FROM profiles`
- **Total Courses** — `SELECT count(*) FROM courses`
- **Total Enrollments** — `SELECT count(*) FROM enrollments`
- **Platform Revenue** — `SELECT sum(amount) FROM payments WHERE status = 'paid'`

Each card shows: current value, change from last 30 days (+N% or -N%), trend arrow icon.

#### 4.2.2 Enrollment Trend (Recharts AreaChart)
- X-axis: last 12 weeks (weekly)
- Y-axis: total new enrollments per week
- One series for paid enrollments, one for free (stacked area)

#### 4.2.3 Top Instructors Table
Columns: Rank · Instructor Name · Courses · Total Students · Avg Rating · Revenue
Top 10 by total enrolled students. Clicking a row links to `/admin/users?id=:instructorId`.

#### 4.2.4 Top Courses Table
Columns: Rank · Course Title · Instructor · Enrolled · Completion % · Revenue
Top 10 by enrolled count. Clicking a row links to `/admin/courses?id=:courseId`.

#### 4.2.5 Recent Admin Actions Feed
Last 10 entries from `audit_logs`, shown as: actor · action · target · timestamp.

---

### 4.3 UserManagementPage (`/admin/users`)

#### 4.3.1 Table

**Columns:** Avatar · Name · Email · Role · Status · Enrolled Courses · Joined · Actions

**Filter bar:**
- Search input: searches `name` or `email` via `ILIKE`
- Role filter: All / Student / Instructor / Admin (dropdown)
- Status filter: All / Active / Deactivated (dropdown)
- Sort: Joined Date (default desc), Name A-Z, Role

**Pagination:** 25 users per page. Show page count and "Showing X–Y of Z users".

#### 4.3.2 Row Actions

Each row has a `⋮` kebab menu with these actions:

| Action | Behaviour |
|--------|-----------|
| **View Profile** | Opens `UserDetailDrawer` (see 4.3.3) |
| **Change Role** | Dropdown: Student / Instructor / Admin. Confirm dialog: "Change [Name]'s role to [Role]?". Edge Function: `PATCH profiles SET role = ?`. Writes audit log. |
| **Deactivate Account** | Sets `profiles.status = 'inactive'`. User can no longer log in (handled by RLS / middleware check). Confirm dialog. Writes audit log. |
| **Reactivate Account** | Sets `profiles.status = 'active'`. Writes audit log. |
| **Impersonate** | Opens a warning modal: "You are about to impersonate [Name]. All actions will be logged." Confirm → Edge Function generates a short-lived impersonation token, stores in `impersonation_sessions`. Admin is redirected to `/student/dashboard` with impersonation banner at the top showing "Viewing as [Name] — Exit Impersonation". All actions during impersonation are flagged in audit log with `impersonated_by = admin_uid`. |
| **Delete Account** | Double-confirm: type email to confirm. Soft delete: sets `name = 'Deleted User'`, `email = null`, `avatar_url = null`, `status = 'deleted'`. Does NOT hard-delete to preserve referential integrity. Writes audit log with original email captured. |

#### 4.3.3 UserDetailDrawer

Right-side slide-in panel, showing:
- Avatar, name, email, role badge, status badge, joined date
- Tabs: **Overview** · **Enrollments** · **Activity**
- Overview: bio, social links (read-only), total courses enrolled, total points, streak
- Enrollments: table of all enrolled courses with progress %
- Activity: last 20 audit/event entries for this user

#### 4.3.4 Bulk Actions

Checkbox column in table. When ≥1 row selected, a bulk action bar appears above the table:
- **Bulk Assign Role** — dropdown → confirm → Edge Function updates all selected users
- **Bulk Deactivate** — confirm → Edge Function
- **Bulk CSV Export** — downloads `name, email, role, status, joined_at` for selected users

#### 4.3.5 Bulk CSV Import

A button "Import Users (CSV)" opens a modal:
- Drag-and-drop or click to select a `.csv` file
- Expected columns: `name, email, role, password` (password optional — if omitted, Supabase sends invite email)
- Preview: show first 5 rows in a table for verification
- On import: Edge Function reads CSV row-by-row:
  - Validate each row (valid email, role is one of student/instructor/admin)
  - If valid: `supabase.auth.admin.createUser(...)` + `INSERT profiles`
  - If invalid: collect errors
- Result modal: "X users created successfully. Y rows had errors:" followed by per-row error messages
- Writes one `audit_log` entry per successfully created user

---

### 4.4 AdminCoursesPage (`/admin/courses`)

**Purpose:** Admins can see ALL courses regardless of instructor, moderate them (approve, reject, force-publish, delete), and quickly navigate to any course.

#### 4.4.1 Table

**Columns:** Thumbnail · Title · Instructor · Category · Status · Price · Enrolled · Submitted For Review · Actions

**Filter bar:**
- Search by title or instructor name
- Filter by status: All / Draft / Pending Review / Published / Archived / Rejected
- Filter by category

#### 4.4.2 Course Status Workflow

Instructors can submit a course for review by setting `status = 'pending_review'` (button in their CourseBuilder → Settings tab). Admins then:
- **Approve** → `PATCH courses SET status = 'published'` + notify instructor
- **Reject** → opens a `RejectDrawer` where admin writes rejection reason → `PATCH courses SET status = 'rejected', rejection_reason = ?` + notify instructor
- **Force Publish** → bypasses review, publishes immediately. Writes audit log.
- **Unpublish** → `PATCH courses SET status = 'draft'`. Writes audit log.
- **Delete** → confirm dialog. Soft delete (status = 'deleted'). Writes audit log. Does not hard-delete — content is preserved in storage.

> Add `status` values `pending_review` and `rejected` to the courses table CHECK constraint if not already present:
```sql
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_status_check;
ALTER TABLE courses ADD CONSTRAINT courses_status_check
  CHECK (status IN ('draft','pending_review','published','archived','rejected','deleted'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMPTZ;
```

---

### 4.5 AnnouncementsPage (`/admin/announcements`)

**Purpose:** Admin composes rich-text announcements and broadcasts them to targeted audiences.

#### 4.5.1 Announcement List

Left panel: list of all announcements (title, target, sent_at or scheduled_at, status: Draft / Sent / Scheduled).

Right panel: Composer or read-only view of selected announcement.

#### 4.5.2 Announcement Composer

| Field | Details |
|-------|---------|
| `title` | Text input, required |
| `body` | TipTap rich text editor (full toolbar) |
| `target_type` | Radio: All Users / Specific Role / Specific Course |
| `target_role` | Shown if target = Specific Role: dropdown (Student / Instructor / Admin) |
| `target_course_id` | Shown if target = Specific Course: course search/select |
| `scheduled_at` | Date-time picker — leave blank to send immediately |
| `send_push` | Toggle — also send as mobile push notification (uses Expo Push API via Edge Function) |
| `send_email` | Toggle — also send as email (uses Resend via Edge Function) |

**Send / Schedule button:**
- If `scheduled_at` is in the future: `INSERT announcements (status='scheduled')` → a Supabase pg_cron job or realtime trigger fires at that time
- If blank: `INSERT announcements (status='sent', sent_at=now())` → immediately `INSERT notifications` for all matching users + optional push/email dispatch via Edge Function

#### 4.5.3 Announcement Delivery Edge Function (`/admin/send-announcement`)

```
Body: { announcement_id }
Auth: admin only (verified via service_role)
Steps:
  1. Fetch announcement with target config
  2. Build recipient list:
     - All users: SELECT id FROM profiles WHERE status = 'active'
     - Specific role: SELECT id FROM profiles WHERE role = ? AND status = 'active'
     - Specific course: SELECT user_id FROM enrollments WHERE course_id = ?
  3. Bulk INSERT notifications:
     INSERT INTO notifications (user_id, type, title, body, metadata)
     SELECT id, 'announcement', title, body, '{announcement_id: ...}'
     FROM recipient_list
  4. If send_email: call Resend API for each recipient (batch, max 100/request)
  5. If send_push: call Expo Push API in batches of 100
  6. UPDATE announcements SET status='sent', sent_at=now()
  7. INSERT audit_log
```

---

### 4.6 PlatformAnalyticsPage (`/admin/analytics`)

A full-page dashboard with date range picker (last 7d / 30d / 90d / 1y / custom) at the top. All charts respect the selected range.

#### Charts & Panels:

**1. Enrollment Trend (AreaChart)**
New enrollments per day, stacked by course type (free vs paid).

**2. Revenue Graph (BarChart)**
Daily revenue in INR. Reference line at monthly average.

**3. Course Completion Rate Distribution (HistogramChart using BarChart)**
X: completion % buckets (0–20%, 20–40%, …, 80–100%). Y: number of students in each bucket. Shows how many students actually finish vs drop early.

**4. Active Users (LineChart)**
DAU (Daily Active Users) based on lesson_progress.updated_at or quiz_attempts.created_at. Separate line for student vs instructor active sessions.

**5. Top Performing Courses (Table)**
Sorted by completion rate. Columns: Course · Enrolled · Completed · Completion % · Avg Rating.

**6. At-Risk Students Preview**
Count of students with < 30% progress after 14 days of enrollment (pre-compute in Phase 7 AI). Shows count as a KPI card linking to Phase 17's full at-risk panel.

**7. Geographic Distribution (optional enhancement)**
If `profiles.country` field exists (add it if not): bar chart of top 10 countries by user count.

**Export All Data button:** Downloads a ZIP containing CSVs for each metric. Generated via Edge Function.

---

### 4.7 AuditLogPage (`/admin/audit-log`)

#### 4.7.1 Table

**Columns:** Timestamp · Actor (name + avatar) · Action · Target Type · Target ID / Name · IP Address · Details

**Filter bar:**
- Search by actor name or email
- Filter by action type (dropdown populated from distinct `action_type` values in DB)
- Date range picker

**Pagination:** 50 entries per page, ordered by `created_at DESC`.

**Detail expansion:** clicking a row expands an inline sub-row showing full `details JSONB` formatted as pretty-printed JSON.

**Export CSV:** downloads filtered results.

#### 4.7.2 Audit Log Table Schema

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT, -- denormalised snapshot at time of action
  action_type TEXT NOT NULL,
  target_type TEXT, -- 'user' | 'course' | 'announcement' | 'enrollment' | etc.
  target_id UUID,
  target_name TEXT, -- denormalised name at time of action
  details JSONB DEFAULT '{}',
  ip_address INET,
  impersonated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for query performance
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);

-- RLS: only admins can read, no one can UPDATE or DELETE
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit logs" ON audit_logs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
-- No INSERT policy from client — all INSERTs via service_role Edge Functions only
```

#### 4.7.3 Audit Log Action Types

All admin actions that must write an audit log entry:

| Action Type | Triggered By |
|-------------|-------------|
| `user.role_changed` | Change Role action |
| `user.deactivated` | Deactivate action |
| `user.reactivated` | Reactivate action |
| `user.impersonation_started` | Impersonate action |
| `user.impersonation_ended` | Exit impersonation |
| `user.deleted` | Delete Account action |
| `user.bulk_imported` | CSV import (one entry per user) |
| `user.bulk_role_changed` | Bulk role action |
| `course.approved` | Approve course |
| `course.rejected` | Reject course |
| `course.force_published` | Force publish |
| `course.unpublished` | Admin unpublish |
| `course.deleted` | Admin delete |
| `announcement.sent` | Send announcement |
| `announcement.scheduled` | Schedule announcement |

---

### 4.8 Supabase Work (Phase 6)

```sql
-- Impersonation sessions (short-lived)
CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  impersonated_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '2 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profile: add status and country columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','deleted'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('all','role','course')),
  target_role TEXT,
  target_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  send_push BOOLEAN DEFAULT false,
  send_email BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for announcements: admins manage, all authenticated read sent ones
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages announcements" ON announcements
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users read sent announcements" ON announcements
  FOR SELECT USING (status = 'sent');
```

#### Admin Edge Functions

All admin Edge Functions must:
1. Call `supabase.auth.getUser()` to get `auth.uid()`
2. `SELECT role FROM profiles WHERE id = auth.uid()` → verify `role = 'admin'`
3. If not admin, return `401 Unauthorized`
4. Use `supabase` client initialised with `service_role` key (available as `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`)

**`/admin/change-user-role`** — changes role, writes audit log  
**`/admin/deactivate-user`** — sets status=inactive, writes audit log  
**`/admin/delete-user`** — soft-deletes, writes audit log  
**`/admin/impersonate-user`** — creates impersonation_session token  
**`/admin/bulk-import-users`** — processes CSV, creates users, writes audit logs  
**`/admin/moderate-course`** — approve/reject/force-publish, writes audit log  
**`/admin/send-announcement`** — delivers announcement to all recipients  
**`/admin/export-analytics`** — generates ZIP of CSV exports  

---

## 5. Phase 7 — AI Core Features

### 5.1 Overview

**Goal:** Three AI features powered by `claude-sonnet-4-5` via Supabase Edge Functions:

1. **AI Tutor** — context-aware streaming chat assistant inside the lesson view
2. **AI Quiz Generator** — generates a complete quiz from lesson content with one click
3. **Lesson Summarizer** — produces a structured bullet-point summary of a lesson

No new pages are added. All AI features appear as drawers, panels, or buttons within existing pages from Phases 3 and 5.

### 5.2 Security Architecture (ABSOLUTE RULES)

- `ANTHROPIC_API_KEY` lives **only** in Supabase Edge Function environment secrets
- It is **never** in `.env` files, `process.env` in the frontend, or any client-side code
- Frontend calls Supabase Edge Functions via `supabase.functions.invoke()`
- Edge Functions call the Anthropic API server-side
- All AI endpoints enforce a **rate limit**: 20 AI requests per `user_id` per day (stored in Supabase, checked at start of each Edge Function before calling Anthropic)
- If rate limit exceeded: Edge Function returns `429 Too Many Requests` with `{"error": "Daily AI limit reached. Resets at midnight UTC."}`

### 5.3 Rate Limit Implementation

```sql
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'tutor_chat' | 'quiz_gen' | 'summarizer'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_usage_user_day ON ai_usage(user_id, created_at);
```

In each Edge Function, before calling Anthropic:
```typescript
const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
const { count } = await supabaseAdmin
  .from('ai_usage')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId)
  .gte('created_at', `${today}T00:00:00Z`)
  .lte('created_at', `${today}T23:59:59Z`);

if (count >= 20) {
  return new Response(JSON.stringify({ error: 'Daily AI limit reached. Resets at midnight UTC.' }), { status: 429 });
}

// After successful call:
await supabaseAdmin.from('ai_usage').insert({ user_id: userId, feature: 'tutor_chat' });
```

---

### 5.4 Feature 1: AI Tutor Chat

#### 5.4.1 UI Placement

The AI Tutor appears as a **slide-in drawer** on the right side of `CoursePlayerPage` (the lesson view from Phase 3). It is accessible via:
- A floating `🤖 Ask AI Tutor` button pinned to the bottom-right of the lesson content area
- A "Tutor" tab in the lesson sidebar (alongside Notes and Q&A tabs if present)

The drawer occupies ~380px of width, slides in from the right. On mobile it occupies full screen.

#### 5.4.2 Drawer UI Structure

```
┌─────────────────────────────────┐
│ 🤖 AI Tutor    [Context: Lesson Title]  [✕]  │
├─────────────────────────────────┤
│                                 │
│  [Chat message bubbles area]    │
│  Scrollable, newest at bottom   │
│                                 │
├─────────────────────────────────┤
│ [Text input] [Send ↵]          │
│  "Ask anything about this lesson…" │
└─────────────────────────────────┘
```

**Chat messages:**
- User messages: right-aligned, indigo bubble
- AI messages: left-aligned, grey bubble, rendered as markdown (use `react-markdown`)
- Streaming: AI response appears character-by-character as it streams in
- Loading indicator: pulsing dots while waiting for first token
- Each conversation stored in `ai_conversations` table

**Conversation persistence:**
- When the drawer opens for a lesson, load existing conversation from `ai_conversations WHERE lesson_id = ? AND user_id = ?`
- If none, start fresh with a greeting: "Hi! I'm your AI Tutor for this lesson. Ask me anything."
- "Clear conversation" button (small, in header) — clears the messages array in state, but optionally keeps DB record (soft clear with a `cleared_at` timestamp)

#### 5.4.3 Edge Function: `/ai/chat`

```typescript
// Request
type RequestBody = {
  messages: { role: 'user' | 'assistant'; content: string }[];
  lesson_id: string;
  course_id: string;
}

// Steps:
// 1. Authenticate user, check rate limit (20/day)
// 2. Fetch lesson content for context:
const { data: lesson } = await supabase.from('lessons').select('title, content, transcript').eq('id', lesson_id).single();
const { data: course } = await supabase.from('courses').select('title, description').eq('id', course_id).single();

// 3. Build system prompt:
const systemPrompt = `You are an AI Tutor for the EduFlow learning platform, embedded in the lesson "${lesson.title}" from the course "${course.title}".

Your role:
- Answer questions about the lesson content clearly and helpfully
- Use the lesson content provided as your primary source
- If a question is unrelated to the lesson or course, gently redirect: "That seems outside our current lesson. Let me help you with the lesson content instead."
- Never make up information not supported by the lesson content
- Keep responses concise unless the student asks for more detail
- Use markdown formatting for code, lists, and emphasis

Lesson content:
${lesson.content?.substring(0, 4000) ?? '(No text content available)'}
${lesson.transcript ? `\n\nVideo transcript excerpt:\n${lesson.transcript.substring(0, 2000)}` : ''}`;

// 4. Call Anthropic with streaming:
const stream = anthropic.messages.stream({
  model: 'claude-sonnet-4-5',
  max_tokens: 1000,
  system: systemPrompt,
  messages: requestBody.messages, // full conversation history from frontend
});

// 5. Return ReadableStream (SSE):
return new Response(stream.toReadableStream(), {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});

// 6. After stream completes:
// UPSERT ai_conversations with updated messages array
// INSERT ai_usage row
```

#### 5.4.4 Frontend: `useStream` Custom Hook

```typescript
// hooks/useStream.ts
export function useStream() {
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = useCallback(async (
    functionName: string,
    body: object,
    onComplete?: (fullText: string) => void
  ) => {
    setStreamedText('');
    setIsStreaming(true);
    let accumulated = '';

    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: { 'Content-Type': 'application/json' },
    });

    // supabase.functions.invoke doesn't support native SSE streaming well.
    // Use fetch directly for SSE:
    const response = await fetch(
      `${supabase.supabaseUrl}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      // Parse SSE format: "data: {...}\n\n"
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        try {
          const json = JSON.parse(line.replace('data: ', ''));
          if (json.type === 'content_block_delta' && json.delta?.text) {
            accumulated += json.delta.text;
            setStreamedText(accumulated);
          }
        } catch {}
      }
    }

    setIsStreaming(false);
    onComplete?.(accumulated);
  }, []);

  return { streamedText, isStreaming, startStream };
}
```

#### 5.4.5 Conversation Persistence Schema

```sql
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]', -- array of {role, content, created_at}
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conversations" ON ai_conversations
  FOR ALL USING (user_id = auth.uid());
```

---

### 5.5 Feature 2: AI Quiz Generator

#### 5.5.1 UI Placement

Inside the instructor's `QuizBuilderDrawer` (Phase 5), at the top there is a section:

```
┌──────────────────────────────────────┐
│ ✨ Generate with AI                  │
│ Questions to generate: [5 ▼]         │
│ Difficulty: [Mixed ▼]                │
│ [Generate Questions]                 │
└──────────────────────────────────────┘
```

Also accessible from the `LessonEditor` (Phase 5) via a button: `+ Add Quiz → Generate with AI`.

After clicking `Generate Questions`:
- Button shows spinner, text changes to "Generating…"
- Disable the button during generation (no streaming on this feature — await full JSON response)
- On success: the generated questions are added to the quiz builder's question list
- Instructor can edit, delete, or reorder them before saving
- Show a toast: "5 questions generated! Review and save them."

**Configuration options:**
- `num_questions`: number select — 3, 5, 10, 15 (default: 5)
- `difficulty`: Mixed / Easy / Medium / Hard
- `question_types`: checkboxes — MCQ, True/False, Short Answer (at least one required)

#### 5.5.2 Edge Function: `/ai/generate-quiz`

```typescript
// Request
type RequestBody = {
  lesson_id: string;
  num_questions: number;    // 3–15
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  question_types: ('mcq' | 'true_false' | 'short_answer')[];
}

// Steps:
// 1. Authenticate, verify instructor owns the lesson's course, check rate limit (5 per lesson, separate from tutor's 20/day)
// 2. Fetch lesson content
// 3. Call Anthropic (NOT streaming — await full response):

const prompt = `You are an expert educator and assessment designer.

Based on the following lesson content, generate exactly ${num_questions} quiz questions.

Requirements:
- Difficulty: ${difficulty}
- Question types to include: ${question_types.join(', ')}
- Each question must test understanding of the lesson content, not just recall
- Distribute question types as evenly as possible
- For MCQ questions: provide exactly 4 options with exactly 1 correct answer
- For True/False: provide a clear statement
- For Short Answer: provide a model answer for instructor reference

Return ONLY valid JSON, no markdown, no preamble:
{
  "questions": [
    {
      "type": "mcq" | "true_false" | "short_answer",
      "body": "Question text",
      "points": 1,
      "explanation": "Why this is the correct answer",
      "options": [  // only for mcq
        { "text": "Option text", "is_correct": false },
        { "text": "Option text", "is_correct": true },
        ...
      ],
      "correct_answer": true | false,  // only for true_false
      "sample_answer": "Model answer text"  // only for short_answer
    }
  ]
}

Lesson content:
${lesson.content?.substring(0, 5000)}`;

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 2000,
  messages: [{ role: 'user', content: prompt }],
});

// 4. Parse JSON response (strip any accidental markdown fences):
const text = response.content[0].text.replace(/```json|```/g, '').trim();
const parsed = JSON.parse(text);

// 5. Return parsed questions
// 6. INSERT ai_usage
return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
```

**Error handling:**
- If JSON parse fails: retry once with a stricter prompt ("Your previous response was not valid JSON. Return only JSON.")
- If second attempt fails: return `500` with `{ error: 'Quiz generation failed. Please try again.' }`

#### 5.5.3 Rate Limit for Quiz Generation

Separate from the tutor's rate limit: **5 quiz generations per lesson per instructor per day**. Use the same `ai_usage` table with `feature = 'quiz_gen'`. Check count where `feature = 'quiz_gen' AND lesson_id = ?` (store `lesson_id` in a `metadata JSONB` column on `ai_usage`).

```sql
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
```

---

### 5.6 Feature 3: Lesson Summarizer

#### 5.6.1 UI Placement

In the student-facing `CoursePlayerPage` (lesson view), in the lesson sidebar or below the lesson content, a button:

```
📝 Summarize this lesson   [loading spinner when active]
```

Also in the instructor's `LessonEditor` (Phase 5): `📝 Generate Summary Preview` button (so instructors can see what students will see).

**Behaviour:**
- Click button → button shows spinner, disabled
- Display a `SummaryPanel` below or alongside the lesson content:
  ```
  ┌─────────────────────────────────────────┐
  │ 📝 AI Summary                    [✕]   │
  ├─────────────────────────────────────────┤
  │ Key Takeaways:                          │
  │  • Point 1                              │
  │  • Point 2                              │
  │  • Point 3                              │
  │                                         │
  │ Main Concepts:                          │
  │  • Concept A: brief explanation         │
  │  • Concept B: brief explanation         │
  │                                         │
  │ What to remember:                       │
  │  [1–2 sentence bottom line]             │
  └─────────────────────────────────────────┘
  ```
- Summary is **cached**: after first generation, saved to `lesson_summaries` table. Subsequent clicks show cached version instantly (no re-generation unless content changed).
- Cache invalidation: if `lessons.updated_at` is newer than `lesson_summaries.generated_at`, show a "Regenerate" button.

#### 5.6.2 Edge Function: `/ai/summarize-lesson`

```typescript
// Request
type RequestBody = { lesson_id: string }

// Steps:
// 1. Authenticate user (student or instructor), check rate limit
// 2. Check cache: SELECT * FROM lesson_summaries WHERE lesson_id = ?
//    If exists AND lesson.updated_at <= summary.generated_at: return cached
// 3. Fetch lesson content (title, content, transcript if available)
// 4. Call Anthropic (NOT streaming):

const prompt = `You are an educational content expert. Summarize the following lesson for a student who wants to review key points.

Structure your response EXACTLY as follows (use these exact headers):

Key Takeaways:
• [3–5 bullet points of the most important facts or skills]

Main Concepts:
• [Concept name]: [one-sentence explanation]
(Repeat for 3–5 concepts)

What to Remember:
[1–2 sentences capturing the single most important takeaway]

Keep the entire summary under 300 words. Be clear and direct.

Lesson title: ${lesson.title}
Lesson content:
${(lesson.content + '\n' + (lesson.transcript ?? '')).substring(0, 6000)}`;

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 600,
  messages: [{ role: 'user', content: prompt }],
});

const summaryText = response.content[0].text;

// 5. UPSERT lesson_summaries
await supabaseAdmin.from('lesson_summaries').upsert({
  lesson_id,
  summary: summaryText,
  generated_at: new Date().toISOString(),
}, { onConflict: 'lesson_id' });

// 6. INSERT ai_usage
// 7. Return summary text
return new Response(JSON.stringify({ summary: summaryText }), { headers: { 'Content-Type': 'application/json' } });
```

#### 5.6.3 lesson_summaries Schema

```sql
CREATE TABLE IF NOT EXISTS lesson_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
  summary TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lesson_summaries ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read summaries for lessons in their enrolled courses
CREATE POLICY "Students read summaries for enrolled lessons" ON lesson_summaries
  FOR SELECT USING (
    lesson_id IN (
      SELECT l.id FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      JOIN enrollments e ON e.course_id = c.id
      WHERE e.user_id = auth.uid()
    )
    OR
    -- Instructors read summaries for their own lessons
    lesson_id IN (
      SELECT l.id FROM lessons l
      JOIN modules m ON m.id = l.module_id
      JOIN courses c ON c.id = m.course_id
      WHERE c.instructor_id = auth.uid()
    )
  );

-- Only Edge Functions (service_role) can INSERT/UPDATE
```

---

## 6. Cross-Phase Database Architecture

### 6.1 Complete Schema Changes Summary

All migrations are additive (no breaking changes to Phase 0–4 tables).

```sql
-- ═══════════════════════════════════════
-- PHASE 5 MIGRATIONS
-- ═══════════════════════════════════════

-- courses: new columns
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS enrollment_limit INTEGER,
  ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_drip_content BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS drip_interval_days INTEGER,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS promo_video_url TEXT,
  ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update courses status constraint
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_status_check;
ALTER TABLE courses ADD CONSTRAINT courses_status_check
  CHECK (status IN ('draft','pending_review','published','archived','rejected','deleted'));

-- modules: add position
ALTER TABLE modules ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- lessons: new columns
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS transcript TEXT; -- Phase 7 AI uses this

-- submissions: grading columns
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS graded_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS feedback TEXT;

-- New tables
CREATE TABLE IF NOT EXISTS rubric_criteria ( ... ); -- See Phase 5 section
CREATE TABLE IF NOT EXISTS rubric_scores ( ... );   -- See Phase 5 section

-- ═══════════════════════════════════════
-- PHASE 6 MIGRATIONS
-- ═══════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS country TEXT;

CREATE TABLE IF NOT EXISTS announcements ( ... );     -- See Phase 6 section
CREATE TABLE IF NOT EXISTS audit_logs ( ... );        -- See Phase 6 section
CREATE TABLE IF NOT EXISTS impersonation_sessions (   -- See Phase 6 section
  ...
);

-- ═══════════════════════════════════════
-- PHASE 7 MIGRATIONS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_conversations ( ... );  -- See Phase 7 section
CREATE TABLE IF NOT EXISTS ai_usage (                 -- See Phase 7 section
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lesson_summaries ( ... ); -- See Phase 7 section
```

### 6.2 Indexes

```sql
-- Phase 5 performance indexes
CREATE INDEX IF NOT EXISTS idx_modules_course_position ON modules(course_id, position);
CREATE INDEX IF NOT EXISTS idx_lessons_module_position ON lessons(module_id, position);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_graded_by ON submissions(graded_by);

-- Phase 6 performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);

-- Phase 7 performance indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_lesson ON ai_conversations(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_day ON ai_usage(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lesson_summaries_lesson ON lesson_summaries(lesson_id);
```

---

## 7. Cross-Phase Edge Functions

### 7.1 Full List of Edge Functions (Phases 5–7)

| Function Path | Phase | Auth Required | Service Role? | Streaming? |
|--------------|-------|---------------|---------------|------------|
| `/instructor/reorder-lessons` | 5 | Yes (instructor) | No | No |
| `/instructor/publish-course` | 5 | Yes (instructor) | No | No |
| `/admin/change-user-role` | 6 | Yes (admin) | Yes | No |
| `/admin/deactivate-user` | 6 | Yes (admin) | Yes | No |
| `/admin/reactivate-user` | 6 | Yes (admin) | Yes | No |
| `/admin/delete-user` | 6 | Yes (admin) | Yes | No |
| `/admin/impersonate-user` | 6 | Yes (admin) | Yes | No |
| `/admin/bulk-import-users` | 6 | Yes (admin) | Yes | No |
| `/admin/moderate-course` | 6 | Yes (admin) | Yes | No |
| `/admin/send-announcement` | 6 | Yes (admin) | Yes | No |
| `/admin/export-analytics` | 6 | Yes (admin) | Yes | No |
| `/ai/chat` | 7 | Yes (any) | No | **Yes (SSE)** |
| `/ai/generate-quiz` | 7 | Yes (instructor) | No | No |
| `/ai/summarize-lesson` | 7 | Yes (any) | No | No |

### 7.2 Shared Edge Function Pattern

```typescript
// supabase/functions/_shared/auth.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Error('Missing authorization header');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.status !== 'active') throw new Error('Account inactive or not found');

  return { user, profile, supabase };
}

export function getAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}
```

---

## 8. Routing Architecture (All New Routes)

All routes should already exist as stubs from Phase 1. This section defines what each stub must be replaced with.

### Phase 5 Routes

```typescript
// In React Router v7 config:
{
  path: '/instructor',
  element: <RoleGuard allowedRoles={['instructor', 'admin']}><InstructorLayout /></RoleGuard>,
  children: [
    { index: true, element: <InstructorDashboardPage /> },
    { path: 'courses', element: <InstructorCoursesPage /> },
    { path: 'courses/new', element: <NewCoursePage /> },
    { path: 'courses/:courseId/edit', element: <CourseBuilderPage /> },
    { path: 'courses/:courseId/analytics', element: <CourseAnalyticsPage /> },
    { path: 'gradebook', element: <GradebookPage /> },
  ]
}
```

### Phase 6 Routes

```typescript
{
  path: '/admin',
  element: <RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard>,
  children: [
    { index: true, element: <AdminDashboardPage /> },
    { path: 'users', element: <UserManagementPage /> },
    { path: 'courses', element: <AdminCoursesPage /> },
    { path: 'announcements', element: <AnnouncementsPage /> },
    { path: 'analytics', element: <PlatformAnalyticsPage /> },
    { path: 'audit-log', element: <AuditLogPage /> },
  ]
}
```

### Phase 7 (No new routes — features added to existing pages)

- AI Tutor drawer added to `/learn/:courseId/lesson/:lessonId`
- Quiz Generator button added to `QuizBuilderDrawer` (Phase 5)
- Lesson Summarizer button added to `CoursePlayerPage`

---

## 9. State Management

### 9.1 New Zustand Stores

#### `instructorStore` (Phase 5)

```typescript
interface InstructorStore {
  selectedCourseId: string | null;
  selectedLessonId: string | null;
  draftCourse: Partial<Course> | null;
  wizardStep: 1 | 2 | 3;

  setSelectedCourse: (id: string | null) => void;
  setSelectedLesson: (id: string | null) => void;
  updateDraftCourse: (updates: Partial<Course>) => void;
  setWizardStep: (step: 1 | 2 | 3) => void;
  resetWizard: () => void;
}
```

#### `adminStore` (Phase 6)

```typescript
interface AdminStore {
  userFilters: { role: string | null; status: string | null; search: string };
  courseFilters: { status: string | null; search: string };
  auditFilters: { actorId: string | null; actionType: string | null; dateRange: [Date, Date] | null };
  impersonating: { userId: string; name: string } | null;

  setUserFilters: (f: Partial<AdminStore['userFilters']>) => void;
  setCourseFilters: (f: Partial<AdminStore['courseFilters']>) => void;
  setAuditFilters: (f: Partial<AdminStore['auditFilters']>) => void;
  startImpersonation: (userId: string, name: string) => void;
  endImpersonation: () => void;
}
```

#### `aiStore` (Phase 7)

```typescript
interface AiStore {
  tutorOpen: boolean;
  tutorLessonId: string | null;
  conversations: Record<string, { role: string; content: string }[]>; // keyed by lesson_id
  isStreaming: boolean;
  streamedResponse: string;

  openTutor: (lessonId: string) => void;
  closeTutor: () => void;
  appendMessage: (lessonId: string, message: { role: string; content: string }) => void;
  setStreaming: (v: boolean) => void;
  setStreamedResponse: (text: string) => void;
  clearConversation: (lessonId: string) => void;
}
```

### 9.2 TanStack Query Keys (all new)

```typescript
// Phase 5
export const instructorKeys = {
  dashboard: () => ['instructor', 'dashboard'],
  courses: () => ['instructor', 'courses'],
  course: (id: string) => ['instructor', 'course', id],
  analytics: (id: string) => ['instructor', 'analytics', id],
  gradebook: (filters: object) => ['instructor', 'gradebook', filters],
  submission: (id: string) => ['instructor', 'submission', id],
};

// Phase 6
export const adminKeys = {
  dashboard: () => ['admin', 'dashboard'],
  users: (filters: object) => ['admin', 'users', filters],
  user: (id: string) => ['admin', 'user', id],
  courses: (filters: object) => ['admin', 'courses', filters],
  announcements: () => ['admin', 'announcements'],
  analytics: (range: string) => ['admin', 'analytics', range],
  auditLog: (filters: object) => ['admin', 'audit', filters],
};

// Phase 7
export const aiKeys = {
  conversation: (lessonId: string) => ['ai', 'conversation', lessonId],
  summary: (lessonId: string) => ['ai', 'summary', lessonId],
};
```

---

## 10. Security & RLS Policies

### 10.1 Complete RLS for New Tables

All new tables require RLS enabled and at minimum one SELECT policy. Write policies are restricted.

```sql
-- ═══════════════ PHASE 5 RLS ═══════════════

-- rubric_criteria (see Phase 5 section for full policies)
ALTER TABLE rubric_criteria ENABLE ROW LEVEL SECURITY;

-- rubric_scores (see Phase 5 section for full policies)
ALTER TABLE rubric_scores ENABLE ROW LEVEL SECURITY;

-- ═══════════════ PHASE 6 RLS ═══════════════

-- audit_logs: admin-read-only (see Phase 6 section)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- announcements: admin manages, authenticated users read sent
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- impersonation_sessions: admin only
ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages impersonation sessions" ON impersonation_sessions
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ═══════════════ PHASE 7 RLS ═══════════════

-- ai_conversations (see Phase 7 section)
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- ai_usage: users read own, service_role writes
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own AI usage" ON ai_usage
  FOR SELECT USING (user_id = auth.uid());
-- No client INSERT policy — only service_role (Edge Functions) can INSERT

-- lesson_summaries (see Phase 7 section)
ALTER TABLE lesson_summaries ENABLE ROW LEVEL SECURITY;
```

### 10.2 Instructor Course Ownership Pattern

Throughout Phase 5, all instructor mutations must verify course ownership. Use this reusable pattern in every Edge Function:

```typescript
// In Edge Function: verify instructor owns the course
async function verifyInstructorOwnership(supabase: any, courseId: string, userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .eq('instructor_id', userId)
    .single();

  if (error || !data) {
    throw new Error('Course not found or access denied');
  }
}
```

---

## 11. Component Library Additions

All new components for Phases 5–7. Each must have a skeleton loader equivalent.

### Phase 5 Components

| Component | File path | Description |
|-----------|-----------|-------------|
| `CourseWizard` | `components/instructor/CourseWizard.tsx` | 3-step form wrapper with step indicator |
| `WizardStep` | `components/instructor/WizardStep.tsx` | Individual step container |
| `CourseBuilder` | `components/instructor/CourseBuilder.tsx` | Tab container for curriculum/settings/preview |
| `CurriculumPanel` | `components/instructor/CurriculumPanel.tsx` | Left/right split: module tree + editor |
| `ModuleTree` | `components/instructor/ModuleTree.tsx` | dnd-kit sortable module list |
| `LessonTreeItem` | `components/instructor/LessonTreeItem.tsx` | Individual draggable lesson row |
| `LessonEditor` | `components/instructor/LessonEditor.tsx` | Full lesson editing form |
| `TipTapEditor` | `components/editor/TipTapEditor.tsx` | Reusable TipTap wrapper with toolbar |
| `VideoUploadZone` | `components/instructor/VideoUploadZone.tsx` | Drag-and-drop + tus progress bar |
| `QuizBuilderDrawer` | `components/instructor/QuizBuilderDrawer.tsx` | Slide-in quiz creation panel |
| `QuestionEditor` | `components/instructor/QuestionEditor.tsx` | Individual question form |
| `AssignmentBuilderDrawer` | `components/instructor/AssignmentBuilderDrawer.tsx` | Slide-in assignment creation |
| `RubricBuilder` | `components/instructor/RubricBuilder.tsx` | Criterion table with dnd reorder |
| `GradingDrawer` | `components/instructor/GradingDrawer.tsx` | Submission viewer + grade form |
| `CompletionFunnelChart` | `components/charts/CompletionFunnelChart.tsx` | Course drop-off bar chart |
| `DropOffHeatmap` | `components/charts/DropOffHeatmap.tsx` | Student × lesson completion grid |
| `StudentProgressDrawer` | `components/instructor/StudentProgressDrawer.tsx` | Per-student lesson breakdown |
| `KPICard` | `components/ui/KPICard.tsx` | Reusable stat card with trend |

### Phase 6 Components

| Component | File path | Description |
|-----------|-----------|-------------|
| `UserTable` | `components/admin/UserTable.tsx` | Paginated user list with filters |
| `UserDetailDrawer` | `components/admin/UserDetailDrawer.tsx` | User overview slide-in |
| `BulkActionBar` | `components/admin/BulkActionBar.tsx` | Floating bar when rows selected |
| `ImpersonationBanner` | `components/admin/ImpersonationBanner.tsx` | Top banner during impersonation |
| `CsvImportModal` | `components/admin/CsvImportModal.tsx` | CSV drag-drop + preview + results |
| `AnnouncementComposer` | `components/admin/AnnouncementComposer.tsx` | TipTap + targeting + send options |
| `AuditLogTable` | `components/admin/AuditLogTable.tsx` | Filterable audit log with expansion |
| `CourseModerateRow` | `components/admin/CourseModerateRow.tsx` | Course row with admin actions |
| `RejectDrawer` | `components/admin/RejectDrawer.tsx` | Rejection reason form for courses |

### Phase 7 Components

| Component | File path | Description |
|-----------|-----------|-------------|
| `AiTutorDrawer` | `components/ai/AiTutorDrawer.tsx` | Slide-in AI chat panel |
| `ChatMessage` | `components/ai/ChatMessage.tsx` | Single message bubble with markdown |
| `StreamingMessage` | `components/ai/StreamingMessage.tsx` | Animated streaming text display |
| `AiRateLimitBanner` | `components/ai/AiRateLimitBanner.tsx` | Shows remaining daily AI calls |
| `QuizGeneratorPanel` | `components/ai/QuizGeneratorPanel.tsx` | Config + generate button in quiz builder |
| `LessonSummaryPanel` | `components/ai/LessonSummaryPanel.tsx` | Formatted summary display |

---

## 12. Error Handling & Loading States

### 12.1 Every page must implement:

- **Skeleton loader** — matches the shape of the real content (not a generic spinner)
- **Error boundary** — `ErrorBoundary` component wrapping each route, shows friendly error + "Try again" button
- **Empty states** — descriptive message + CTA when tables/lists are empty
- **Toast notifications** (Sonner) for all mutations: success and error

### 12.2 Specific cases

| Scenario | Handling |
|----------|----------|
| Video upload fails mid-way | tus auto-retries. After 3 failures: toast "Upload failed. Your progress is saved — click to resume." |
| AI rate limit reached (429) | Show `AiRateLimitBanner` with "You've used all 20 AI requests today. Resets at midnight UTC." Disable all AI buttons. |
| AI response error (500) | Toast: "AI service unavailable. Please try again in a moment." |
| Admin action fails (403) | Toast: "You don't have permission to do this." Log to console. |
| CSV import partial failure | Show per-row error table in modal. Do not block successfully imported rows. |
| Course publish validation fails | Show inline errors: "Your course needs at least 1 published lesson before you can publish." |
| Lesson auto-save fails | Show "Failed to save. Retrying…" indicator. Retry every 5 seconds up to 3 times. If still failing: "Save failed. Please copy your content and refresh." |
| Streaming disconnected | Detect via SSE `onerror` → show "Connection interrupted. " + retry button. |

---

## 13. Testing Requirements

### 13.1 Unit Tests (Vitest)

Write unit tests for:
- `useStream` hook — mock fetch, verify chunks accumulate correctly
- Quiz generator JSON parser — test with valid JSON, invalid JSON, markdown-wrapped JSON
- CSV import row validator — test valid rows, invalid emails, invalid roles
- Rate limit counter logic — test boundary conditions (exactly 20, exactly 21)
- Lesson auto-save debounce — test that rapid typing produces exactly one save after 2s

### 13.2 Integration Tests (Vitest + Supabase local)

- Instructor can create course, add module, add lesson, publish course
- Admin can change user role (verify `audit_logs` entry created)
- Admin cannot access admin pages if `role !== 'admin'`
- Instructor cannot edit another instructor's course (RLS verified)
- AI Tutor rate limit correctly blocks request 21+ per day

### 13.3 E2E Tests (Playwright)

Critical flows to cover:
1. Instructor sign-up → creates course → publishes → student enrolls → lesson visible
2. Admin changes a student's role to instructor → user can now access `/instructor`
3. Admin sends announcement → notification appears in student's notification bell
4. Student asks AI Tutor question → response streams in → stored in DB
5. Instructor generates quiz with AI → reviews questions → saves quiz → student takes it

---

## 14. Critical Implementation Rules

These rules must be followed without exception:

### Security

> **Never expose `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or any other server secret in the frontend.** If any of these appear in `.env` files loaded by Vite (i.e., prefixed with `VITE_`), that is a critical security breach. All secrets live exclusively in Supabase Edge Function environment variables.

> **All admin database mutations must go via Edge Functions using service_role.** No admin page should call `supabase.from('profiles').update(...)` directly from the browser — this would bypass RLS and allow privilege escalation.

> **Verify admin role inside every admin Edge Function**, not just in the frontend `RoleGuard`. Frontend guards are UX-only. The Edge Function is the security boundary.

### Data Integrity

> **Course publish is a deliberate action, not automatic.** There must always be a confirm dialog before `status = 'published'`. Publishing validation (≥1 lesson) runs in the Edge Function, not the UI.

> **Assignment grading is idempotent.** Clicking "Save Grade" twice must not create two `rubric_scores` rows. Use `UPSERT` with `ON CONFLICT (submission_id, criterion_id)`.

> **Audit log entries are write-once.** There is no UPDATE or DELETE policy on `audit_logs` — not even for admins. The table is an immutable record.

> **Impersonation must always write an audit log.** There is no exception. The Edge Function must fail the entire impersonation request if the audit log INSERT fails.

### Realtime & Streaming

> **Every Supabase Realtime subscription must be cleaned up in `useEffect` return.** Missing cleanup in Phase 6 admin pages (announcement delivery) causes ghost subscriptions and duplicate notifications.

> **The AI Tutor SSE stream must handle partial JSON chunks.** The `useStream` hook must buffer incomplete `data:` lines across multiple `read()` calls before attempting `JSON.parse`.

> **AI streaming responses must never block the UI thread.** The `startStream` function must be called without `await` in the click handler (fire-and-forget pattern, with state updates triggering re-renders).

### Performance

> **All admin tables must use cursor-based pagination, not OFFSET.** For `audit_logs` and `profiles` tables that can have 100K+ rows, use `WHERE created_at < :cursor ORDER BY created_at DESC LIMIT 25`.

> **The `DropOffHeatmap` must only render for the first 50 students.** Rendering 200+ students × 50 lessons = 10,000 cells will freeze the browser. Show "Showing first 50 students. Export CSV for full data." if more.

> **TipTap editor content must not be stored in Zustand or component state for large lessons.** Use TipTap's internal state + debounced callbacks for auto-save. Storing HTML in Zustand causes excessive re-renders.

### dnd-kit

> **Lesson reorder must optimistically update the UI** before the Edge Function confirms. If the Edge Function fails, revert the reorder with a toast: "Reorder failed. Restoring original order."

> **Module + lesson position values must be contiguous integers starting at 0.** After any reorder or delete operation, renumber all positions to avoid gaps.

---

## 15. Acceptance Criteria

### Phase 5 — Instructor Features

- [ ] Instructor can create a course via the 3-step wizard and the course appears in their course list with status "Draft"
- [ ] Course thumbnail uploads successfully to Supabase Storage and displays in the course list
- [ ] Instructor can add modules and lessons; both appear in the curriculum tree
- [ ] Drag-and-drop reorder of lessons persists after page refresh
- [ ] Video upload via tus shows progress bar; uploaded video is playable in the lesson view
- [ ] TipTap lesson content auto-saves within 2 seconds of stopping typing; "Saved ✓" shows in editor
- [ ] Quiz builder allows adding MCQ, True/False, and Short Answer questions
- [ ] Assignment builder creates assignment with rubric; rubric criteria visible in gradebook
- [ ] Instructor can grade a submission in GradingDrawer; student's submission shows as graded in their gradebook (Phase 3)
- [ ] Batch grade override works on multiple selected submissions
- [ ] CourseAnalyticsPage shows completion funnel with correct per-module percentages
- [ ] Course publish is blocked if no lessons exist; validation message shown
- [ ] Admin can also access all instructor pages (RoleGuard allows admin)

### Phase 6 — Admin Features

- [ ] Admin dashboard KPI cards show correct counts matching DB state
- [ ] Admin can change any user's role; change reflected immediately in profiles table + audit log entry created
- [ ] Admin can deactivate a user; deactivated user cannot log in (auth middleware blocks inactive profiles)
- [ ] Impersonation shows banner at the top; all impersonated actions appear in audit log with `impersonated_by` field
- [ ] CSV import creates users and reports per-row errors for invalid rows; successful rows are not blocked by invalid ones
- [ ] Admin can approve a pending-review course; instructor receives an in-app notification
- [ ] Admin can reject a course with a reason; reason visible to instructor in their course settings
- [ ] Announcement sent to "All Users" creates a notification for every active user in DB
- [ ] Scheduled announcement does not fire immediately; fires at scheduled time
- [ ] Audit log shows every admin action performed during testing; entries cannot be deleted
- [ ] PlatformAnalyticsPage date range filter correctly scopes all charts
- [ ] Admin is redirected to `/403` if trying to access `/admin` with a non-admin role token

### Phase 7 — AI Core

- [ ] AI Tutor drawer opens in lesson view; sends message; response streams character-by-character
- [ ] Tutor response is contextually relevant to the lesson content (system prompt includes lesson text)
- [ ] Conversation persists across page refreshes (loaded from `ai_conversations` table)
- [ ] After 20 AI requests in a day, all AI features show rate limit message; requests are blocked server-side (test via Edge Function log)
- [ ] Quiz generator produces valid JSON with the requested number of questions, matching selected difficulty and types
- [ ] Generated questions appear in the quiz builder for instructor review; can be edited before saving
- [ ] Lesson summarizer returns structured summary within 10 seconds for a lesson of 2000 words
- [ ] Cached summary loads instantly on second click; "Regenerate" shows if lesson content changed
- [ ] `ANTHROPIC_API_KEY` is NOT present anywhere in the browser's network requests or frontend environment (verify via DevTools → Application → Environment)
- [ ] All three AI Edge Functions return `429` when daily limit is exceeded; no Anthropic API call is made after limit is hit

---

*End of EduFlow PRD — Phases 5, 6 & 7*  
*Document prepared for autonomous agent implementation.*  
*Prerequisite: Phases 0–4 stable and deployed.*
