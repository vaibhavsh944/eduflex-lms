# EduFlow: As-Built Product Requirements Document (PRD)
**Current Status:** Phases 1 through 5 Completed
**Target Platform:** Web (Desktop optimized, Mobile responsive)
**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Recharts, TipTap, @dnd-kit, React Router v6.

---

## 1. Executive Summary
EduFlow is a modern, gamified Learning Management System (LMS) designed for two primary user personas: **Students** and **Instructors** (with Admin roles pending in Phase 6). The platform emphasizes highly interactive learning, social engagement, and powerful course creation tools.

This document outlines the features and architecture that have been **fully implemented** in the codebase up to Phase 5.

---

## 2. Core Architecture & Infrastructure (Phase 1)
The foundation of the application provides robust routing, type safety, and UI consistency.

*   **Routing System:** Implemented via `react-router-dom` with robust route constants (`src/lib/constants.ts`). Includes role-based access control (`ProtectedRoute` and `RoleGuard` components).
*   **Data Layer:** Currently operating on a sophisticated mock data layer (`src/lib/mockData.ts`) mapped precisely to Supabase SQL schema migrations (`phase1.sql` through `phase5_instructor.sql`). Data fetching is simulated asynchronously using custom React hooks (`useStudent.ts`, `useInstructor.ts`, etc.) mimicking React Query patterns.
*   **Design System:** Built exclusively on Tailwind CSS and Shadcn UI. All core components (Buttons, Dialogs, Sheets, Forms, Selects, Dropdowns, Tabs, Tables) have been integrated and typed.

---

## 3. Student Experience & Discovery (Phase 2)
The student-facing portal focuses on engagement, discovery, and tracking progress.

### Student Dashboard (`StudentDashboardPage`)
*   **Overview Metrics:** Displays total enrolled courses, completion percentage, current streak (gamification), and total earned points.
*   **Continue Learning:** A prominent card highlighting the student's most recently active course with a progress bar and direct "Resume" CTA.
*   **Upcoming Deadlines:** A timeline view of impending assignments and quizzes.

### Course Catalog & Discovery (`SearchPage` / `CourseCatalogPage`)
*   **Search & Filter:** Advanced filtering by Category, Difficulty Level, Rating, and Price.
*   **Course Cards:** Visually rich cards displaying course thumbnails, instructor info, ratings, and price tags.
*   **Course Overview (`CourseOverviewPage`):** A pre-enrollment landing page for a specific course displaying the syllabus/curriculum outline, instructor bio, learning objectives, and a sticky enrollment/purchase card.

### Student Enrolled Courses (`StudentCoursesPage`)
*   Grid layout of all purchased/enrolled courses with individual progress indicators.

---

## 4. Course Player & Learning Engine (Phase 3)
The core learning environment where students consume content.

### The Player Interface (`CoursePlayerPage`)
*   **Sidebar Navigation:** A collapsible accordion sidebar listing all modules and lessons. Includes visual checkmarks for completed lessons.
*   **Main Content Area:** Dynamically renders content based on lesson type:
    *   **Video:** Custom `VideoPlayer` component.
    *   **Text/Article:** Rendered markdown/HTML.
    *   **PDF/Document:** `PDFViewer` component.
    *   **Quiz/Assignment:** Interactive forms for submissions.
*   **Interactive Right Panel:** A tabbed interface alongside the content:
    *   **Notes:** `NotesPanel` for students to take time-stamped personal notes during a lesson.
    *   **Discussion:** `DiscussionPanel` for lesson-specific Q&A between students and instructors.
*   **Completion Flow:** "Mark as Complete" functionality that triggers a celebratory `CourseCompleteModal` (with gamified UI) upon finishing the final lesson.

---

## 5. Social & Gamification Features (Phase 4)
Features designed to increase retention and student interaction.

### Student Profile & Achievements (`StudentProfilePage`)
*   **Public/Private Profile:** Displays user bio, joined date, and learning stats.
*   **Badges System:** Visual representation of earned achievements (e.g., "First Course Completed", "7-Day Streak").
*   **Activity Heatmap:** Github-style contribution graph representing daily learning activity.

### Community Forum (`ForumPage` & `ForumThreadPage`)
*   System-wide discussion boards categorized by topics (e.g., General, Course-specific).
*   Nested threading, upvoting, and rich-text replies.

### Leaderboard (`LeaderboardPage`)
*   Global and weekly ranking of students based on points earned from completing lessons and interacting in forums.

### Notifications & Messaging
*   **In-App Notifications:** Dropdown menu (`NotificationDropdown`) for alerts on grades, replies, and system announcements.
*   **Direct Messaging:** `MessageBubble` and `ThreadListItem` components for 1-on-1 communication.

---

## 6. Instructor Capabilities (Phase 5)
Comprehensive tools for content creators to build and manage their educational products.

### Instructor Dashboard (`InstructorDashboardPage`)
*   **KPI Tracking:** High-level metrics for Total Revenue, Active Students, Average Rating, and Enrollments.
*   **Data Visualization:** Integrated **Recharts** to display area charts (Revenue Trends) and bar charts (Enrollment by Course).

### Course Management (`InstructorCoursesPage` & `NewCoursePage`)
*   **Course List:** A data table displaying all instructor-owned courses with status badges (Draft/Published), pricing, and quick actions (Edit, Analytics, Delete).
*   **Creation Wizard:** A 3-step course creation flow utilizing `react-hook-form` and `zod` for robust validation (Details -> Pricing & Settings -> Review). Supports Free, Paid, and Subscription pricing models.

### Advanced Course Builder (`CourseBuilderPage`)
*   **Split-Pane Interface:** A massive, complex page divided into Curriculum, Settings, and Preview tabs.
*   **Curriculum Drag-and-Drop (`CurriculumBuilder`):** Built with `@dnd-kit`, allowing instructors to vertically drag, drop, and reorder Modules and nested Lessons.
*   **Rich Content Editor (`LessonEditor`):** Integrated `@tiptap/react` for WYSIWYG rich-text editing of lesson content. Includes settings for marking lessons as "Free Previews".

### Analytics & Grading
*   **Course Analytics (`CourseAnalyticsPage`):** Detailed metrics for individual courses. Features a Completion Funnel chart (Enrolled -> Started -> Midpoint -> Completed) and Quiz Score distributions.
*   **Gradebook (`GradebookPage`):** A data table of all student submissions (assignments/quizzes).
*   **Grading Drawer:** A slide-out Shadcn `Sheet` allowing instructors to view submitted files/text, evaluate against defined **Rubrics**, assign a score, and provide written feedback.

---

## 7. Current Technical State & Next Steps
*   **TypeScript:** The project compiles cleanly (`tsc --noEmit` yields 0 errors).
*   **UI Consistency:** All custom UI elements have been refactored to align with standard Radix UI + Shadcn patterns.
*   **Pending Implementation (Phase 6 & 7):**
    *   **Phase 6 (Admin):** System-wide dashboard, user moderation, platform financial reports, category management.
    *   **Phase 7 (AI):** LLM integration for AI-assisted quiz generation, smart tutoring chatbots, and automated grading suggestions.
*   **Backend Integration:** The frontend is entirely structurally sound and ready to be wired to a live Supabase backend instance by swapping the `src/hooks/queries` implementations from mock delays to actual `supabase-js` API calls.
