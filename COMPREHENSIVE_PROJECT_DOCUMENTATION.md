# EduFlow LMS - Comprehensive Project Requirements & Architecture Document

This document serves as the master blueprint and detailed breakdown of the EduFlow LMS project. It covers the complete architecture, file structures, database schemas, feature modules, and user workflows present in the monorepo. 

---

## 1. Project Overview & Monorepo Structure

EduFlow is a state-of-the-art, feature-rich Learning Management System (LMS) designed for students, instructors, and administrators. It supports comprehensive online education features including rich content delivery, live sessions, gamification, advanced assessments, e-commerce, and AI-driven insights.

### 1.1 Directory Structure
The project is structured as a modern monorepo using npm workspaces:
- **`/web`**: The main frontend React application (Vite, TypeScript, TailwindCSS).
- **`/mobile`**: The cross-platform mobile application (React Native, Expo, NativeWind).
- **`/shared`**: Shared TypeScript types and utilities used across web, mobile, and edge functions.
- **`/supabase`**: Backend infrastructure including database migrations, edge functions, and configuration.
- **`/.github`**: CI/CD pipelines (GitHub Actions for typechecking, linting, Playwright E2E, Lighthouse CI).

### 1.2 Technology Stack
- **Frontend (Web)**: React 19, React Router v7, Zustand (State Management), TanStack React Query v5 (Data Fetching), Tailwind CSS v3, Radix UI + shadcn/ui (Component Library), TipTap (Rich Text Editor), Daily.co (Live Video).
- **Frontend (Mobile)**: Expo 52, React Native 0.76, Expo Router, NativeWind (Tailwind for RN).
- **Backend (Supabase)**: PostgreSQL Database, Row Level Security (RLS), Supabase Auth, Storage, Edge Functions (Deno), Realtime Subscriptions.
- **Shared**: TypeScript for end-to-end type safety (`@eduflow/shared`).

---

## 2. Database Schema & Data Models

The database is built on PostgreSQL (via Supabase) and heavily utilizes Row Level Security (RLS) to enforce data access policies. The schema has evolved over 23+ migration phases.

### Core Entities
- **Profiles (`profiles`)**: Extends Supabase Auth users. Tracks `role` (`student`, `instructor`, `admin`), `total_xp`, `level`, `bio`, preferences, and integrated platform IDs.
- **Courses (`courses`)**: The root learning container. Contains metadata (`pricing_type`, `status`, `duration_minutes`, `rating`), instructor linking, and categorization.
- **Modules & Lessons (`modules`, `lessons`)**: Hierarchical content structure. Lessons support multiple types (`video`, `pdf`, `text`, `quiz`, `assignment`, `embed`, `scorm`, `h5p`, `code`, `math`).
- **Enrollments (`enrollments`)**: Links students to courses, tracking `status` (`active`, `completed`, `dropped`) and `progress` (0-100).
- **Assessments (`quizzes`, `questions`, `quiz_options`, `assignments`)**: Support for advanced configuration (grace periods, proctoring flags, competency checks).
- **Submissions & Grades (`submissions`, `grades`)**: Student work tracking with instructor or AI grading, rubric scores, and peer review tracking.
- **Gamification (`badges`, `user_badges`, `points_log`, `user_streaks`, `certificates`)**: Tracks XP, streaks, level progression, and issues verifiable certificates.
- **Social & Forum (`threads`, `replies`, `study_groups`, `study_group_members`)**: Discussions, QA sections per lesson, and private/public study groups.
- **Live Learning (`live_sessions`, `live_polls`, `office_hour_slots`)**: Manages scheduled sessions, daily.co room URLs, polls, and whiteboard states.
- **Payments (`payments`, `coupons`, `instructor_earnings`, `invoices`)**: Tracks Razorpay orders, applied discounts, revenue splits, and platform cuts.
- **Admin & Org (`organizations`, `departments`, `semesters`, `audit_logs`)**: Multi-tenant or grouped organizational structure and system audit trails.

---

## 3. Frontend Architecture (Web)

The web application (`/web/src`) is heavily modularized into features, shared UI components, and distinct user-role layouts.

### 3.1 Routing Strategy (`App.tsx`)
The application uses `react-router-dom` with a layout-based and role-guarded route structure:
- **Public Layout**: `/`, `/catalog`, `/catalog/:courseId`, `/accessibility`, `/verify/:certificateId`
- **Auth Layout**: `/login`, `/signup`, `/forgot-password`, `/reset-password`
- **Student Layout (RoleGuard: student)**: `/student/dashboard`, `/student/courses`, `/student/grades`, `/student/progress`, `/student/badges`
- **Learn Layout (RoleGuard: student | instructor)**: `/learn/:courseId`, `/learn/:courseId/lesson/:lessonId`, `/learn/:courseId/quiz/:quizId`, `/learn/:courseId/live`
- **Instructor Layout (RoleGuard: instructor | admin)**: `/instructor`, `/instructor/courses/new`, `/instructor/courses/:courseId/edit`, `/instructor/gradebook`, `/instructor/revenue`
- **Admin Layout (RoleGuard: admin)**: `/admin/dashboard`, `/admin/users`, `/admin/reports`, `/admin/settings`, `/admin/audit-logs`
- **Shared/RoleAware Layout**: `/messages`, `/notifications`, `/profile`, `/leaderboard`, `/forum`

### 3.2 State Management (Zustand)
State is localized into distinct feature stores located in `/web/src/store`:
- `authStore`: User session, role, authentication loading state.
- `themeStore`: Dark/Light mode, Colorblind modes, Reading modes (fonts, spacing, backgrounds).
- `coursePlayerStore`: Active lesson tracking, module progression, player sidebar state.
- `gamificationStore`: Points tracking, level calculation, streak tracking.
- `chatStore` & `messageStore`: Direct messages, study group chats, typing indicators.
- `liveSessionStore`: Poll queues, hand-raise queues, whiteboard state during Daily.co sessions.
- `quizStore`: Active attempt state, timer synchronization.
- `adminStore`, `aiStore`, `forumStore`, `notificationStore`, `paymentStore`.

### 3.3 Data Fetching (TanStack React Query)
API interactions are split into `/web/src/hooks`:
- **Queries (`/queries`)**: `useCourse`, `useInstructor`, `useGamification`, `useProgressAnalytics`, `useAdmin`, etc.
- **Mutations (`/mutations`)**: `useUpdateProfile`, `useMarkLessonComplete`, `useQuizAttempt`, etc.
- **Realtime (`/realtime`)**: `useMessageRealtime`, `useNotificationRealtime`, `usePresenceHeartbeat`.

### 3.4 Component Structure
Components (`/web/src/components`) are strictly categorized:
- **`/ui`**: Base shadcn/ui components (buttons, dialogs, select, tables, accordions).
- **`/layout`**: Shell components (TopBar, Sidebar, MobileBottomNav, ProfileDropdown).
- **`/shared`**: Global Search, SEO, ErrorBoundary, PageLoading.
- **Domain Specific**: `/admin`, `/courses`, `/dashboard`, `/editor` (TipTap), `/forum`, `/gamification`, `/instructor`, `/live`, `/player`, `/quiz`.

---

## 4. Mobile Architecture (React Native)

The mobile app (`/mobile`) provides native access to core student and instructor features using Expo.

### 4.1 Routing (Expo Router)
- `_layout.tsx`: Root layout managing Supabase auth initialization and Push Notification setup.
- `/(auth)`: Login and signup screens.
- `/(tabs)`: Main bottom navigation for students (Dashboard, Catalog, Profile).
- `/course/[courseId]`: Deep dive into course content.
- `/course/[courseId]/lesson/[lessonId]`: VideoPlayer, TextLesson, PDF rendering.
- `/course/[courseId]/quiz/[quizId]`: Mobile-optimized quiz taking interface.

### 4.2 Key Mobile Components
- `VideoPlayer`: Custom wrapper around `expo-av` with bookmarking and speed controls (`SpeedControlSheet`).
- `QuizPlayerMobile`: Touch-optimized MCQ and short-answer interface.
- `NotificationRow`: Interactive push notification history.
- Offline support via SQLite and Async Storage caching mechanisms (implied by typical LMS mobile patterns).

---

## 5. Core System Workflows

### 5.1 Authentication & Onboarding
1. User signs up via Email/Password or Google OAuth (handled by Supabase Auth).
2. Supabase Trigger automatically creates a `profiles` record.
3. User lands on onboarding (if needed) or directly to their respective Dashboard based on Role.
4. `useAuthStore` boots up, fetches the profile, and starts the `streakBootstrap` process.

### 5.2 Course Creation & Publishing (Instructor Flow)
1. Instructor navigates to `/instructor/courses/new`, entering basic metadata (CourseWizard).
2. Instructor uses `CourseBuilderPage` to visually structure Modules and Lessons (`ModuleTree`, `CurriculumBuilder`).
3. Content is authored using `LessonEditor` (TipTap rich text, Video uploads to Supabase Storage, ScormUploader).
4. Assessments are built using `QuizBuilderDrawer` and `RubricBuilder`.
5. Instructor sets pricing (`paid`, `free`) and hits Publish.

### 5.3 Student Learning Journey
1. Student explores `/catalog` (using `FilterPanel`, `GlobalSearch`).
2. Student enrolls via `/catalog/:courseId` (triggers `PaymentModal` or direct `enrollments` insertion).
3. Student enters `/learn/:courseId`, dropping into the `CoursePlayerPage`.
4. `CoursePlayerSidebar` shows progress. The student navigates through `VideoPlayer`, `TextLesson`, `PDFViewer`.
5. Upon video completion or reading, `useMarkLessonComplete` mutation updates `lesson_progress`.
6. Gamification engine triggers: Points awarded via Edge Function, checking for newly unlocked badges or streak increments.
7. Course completion automatically mints a verifiable `Certificate`.

### 5.4 Advanced Assessments & AI Grading
1. Quizzes enforce time limits, grace periods, and max attempts.
2. `ProctoringWarningModal` listens for tab-switches or lost focus during a quiz, logging `ProctoringFlag`s.
3. For assignments, students use `FileUploadZone` or `TipTapEditor`.
4. Instructors use `GradingDrawer` to score against a Rubric.
5. AI Grading (Phase 17): `GradeWithAIButton` calls an Edge Function that analyzes the text submission against the rubric and suggests scores.

### 5.5 Live Learning (Daily.co)
1. Instructor schedules a session (`LiveSessionFormSheet`).
2. At the scheduled time, an Edge Function creates a Daily.co room.
3. Students join `/learn/:courseId/live/:sessionId`. The `DailyIframeWrapper` embeds the video call.
4. `LiveSessionStore` syncs real-time events via Supabase Realtime: `RaiseHandButton`, `PollModal`, `WhiteboardPanel`.

### 5.6 Social & Forums
1. Each course has a global forum `/forum/:courseId` mapped to `ForumThreadPage` and `ThreadDetailPage`.
2. Lessons have inline Q&A (`QAQueuePanel`, `LessonQA`).
3. Users can form `StudyGroups` with private group chat (`GroupChatPanel`) and collaborative notes (`GroupDocPanel`).

### 5.7 Administration & Analytics
1. Admins access `/admin` to view platform-wide metrics (`AdminDashboard`, `AdminAnalytics`).
2. `AdminUsers` provides a full CRM-like view of all users (`UserTable`, `UserDetailDrawer`).
3. `AuditLogTable` tracks all destructive or significant actions across the system.
4. Revenue, Coupons, Organizations, and Semesters are fully manageable via dedicated Admin pages.

### 5.8 External Integrations & Webhooks
1. **Google Calendar**: Students sync deadlines (`CalendarSyncToggle`).
2. **Google Drive**: Instructors import assets directly (`DrivePickerButton`).
3. **Webhooks**: Organizations subscribe to events (e.g., `course.completed`, `user.enrolled`) configured in `AdminWebhooksPage`. Retries are handled via `retry-webhooks` Edge Function.

---

## 6. Edge Functions (Supabase)

The `/supabase/functions` directory contains Deno edge functions for secure backend processing:
- **Payments**: `generate-invoice`, `mark-instructor-paid`.
- **Integrations**: `import-google-drive`, `sync-google-calendar`, `google-oauth-callback`.
- **Assessments**: `grade-quiz`, `submit-quiz`, `start-attempt`, `competency-check`.
- **System**: `fire-webhooks`, `retry-webhooks`, `semester-rollover`, `export-user-data`, `delete-account`.
- **AI & Processing**: `ai` (general AI endpoints), `captions` (transcription jobs via AssemblyAI), `check-rate-limit`.
- **Social**: `forum`, `mentorship`, `resolve-org`, `scorm`.

---

## 7. Configuration & DevOps

- **Tailwind Config (`tailwind.config.ts`)**: Defines the design system, specific brand colors (brand 50-950), font families (Sora, DM Sans, JetBrains Mono), and custom animations (accordion, float, skeleton-shimmer).
- **Vite Config (`vite.config.ts`)**: Configures build chunking (vendor, ui, editor, query, player, ai, i18n, payments) and module path aliases (`@/` and `@shared/`).
- **ESLint (`eslint.config.js`)**: Strict TypeScript linting rules, React Hooks validation.
- **CI Pipelines (`.github/workflows`)**:
  - `ci.yml`: Type checking, linting, and Vite builds.
  - `e2e.yml`: Playwright end-to-end browser testing and Axe-core accessibility audits.
  - `lighthouse.yml`: Performance, Accessibility, Best Practices, and SEO score tracking using Lighthouse CI.
- **Vercel (`vercel.json`)**: Configures SPA routing (rewrites to `/index.html`) and strict security headers (Content-Security-Policy equivalents).

---

## Conclusion
EduFlow is an enterprise-grade LMS utilizing a modern, scalable React/Node ecosystem. The monorepo guarantees type safety across the client, mobile app, and backend definitions. The extensive feature set covers every aspect of modern e-learning—from simple video delivery to complex proctored assessments, gamified engagement, live interactivity, and deep administrative control.
