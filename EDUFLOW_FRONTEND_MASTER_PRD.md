# EduFlow LMS — Frontend Master PRD
**Version:** 1.0 | **Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase  
**Audience:** AI coding agent (Cursor / Claude Code / Antigravity)  
**Rule:** Build EXACTLY what is specified here. No improvisation. No skipping. No placeholders.

---

## TABLE OF CONTENTS

1. [Project Architecture](#1-project-architecture)
2. [Design System & Tokens](#2-design-system--tokens)
3. [Folder Structure](#3-folder-structure)
4. [Shared Types](#4-shared-types)
5. [Supabase Client Setup](#5-supabase-client-setup)
6. [Global State (Zustand Stores)](#6-global-state-zustand-stores)
7. [Routing — All 40+ Routes](#7-routing--all-40-routes)
8. [Layouts (5 layouts)](#8-layouts-5-layouts)
9. [Phase 1 — Auth Pages (5 pages)](#9-phase-1--auth-pages-5-pages)
10. [Phase 2 — Public Pages (3 pages)](#10-phase-2--public-pages-3-pages)
11. [Phase 3 — Student Core Learning (6 pages)](#11-phase-3--student-core-learning-6-pages)
12. [Phase 4 — Student Extended (8 pages)](#12-phase-4--student-extended-8-pages)
13. [Phase 5 — Instructor Features (4 pages)](#13-phase-5--instructor-features-4-pages)
14. [Phase 6 — Admin Features (11 pages)](#14-phase-6--admin-features-11-pages)
15. [Phase 7 — AI Features (3 modals/overlays)](#15-phase-7--ai-features-3-modalsoverlays)
16. [Phase 8 — Certificates, Badges & Gamification](#16-phase-8--certificates-badges--gamification)
17. [Phase 9 — Payments (Razorpay)](#17-phase-9--payments-razorpay)
18. [Shared Component Library](#18-shared-component-library)
19. [TanStack Query Patterns](#19-tanstack-query-patterns)
20. [Supabase Realtime Patterns](#20-supabase-realtime-patterns)
21. [Error Handling & Loading States](#21-error-handling--loading-states)
22. [Performance & Accessibility](#22-performance--accessibility)
23. [Environment Variables](#23-environment-variables)
24. [Critical Rules (Non-Negotiable)](#24-critical-rules-non-negotiable)

---

## 1. PROJECT ARCHITECTURE

### Stack (mandatory — no substitutions)
| Layer | Technology | Version |
|---|---|---|
| Build tool | Vite | ^5.x |
| Framework | React | 18.x |
| Language | TypeScript | 5.x (strict mode) |
| Routing | React Router | v6 |
| Styling | Tailwind CSS | 3.x |
| UI components | shadcn/ui | latest |
| Global state | Zustand | ^4.x |
| Server state | TanStack Query | v5 |
| Forms | React Hook Form + Zod | latest |
| Rich text editor | TipTap | ^2.x |
| Charts | Recharts | ^2.x |
| Drag & drop | dnd-kit | ^6.x |
| Icons | Lucide React | latest |
| Toast notifications | Sonner | latest |
| Backend | Supabase JS client | ^2.x |
| Animation | CSS keyframes + Tailwind animate | — |

### Monorepo layout
```
/
├── web/          ← THIS PRD covers this folder
├── mobile/       ← React Native + Expo (separate PRD)
└── shared/       ← Shared TypeScript types
```

All commands below assume working directory is `/web`.

### Init commands (run once)
```bash
npm create vite@latest web -- --template react-ts
cd web
npm install react-router-dom @supabase/supabase-js zustand @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image
npm install recharts @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react sonner
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init
# shadcn/ui components needed (add as built):
npx shadcn-ui@latest add button input label card dialog sheet dropdown-menu
npx shadcn-ui@latest add tabs select checkbox radio-group switch badge
npx shadcn-ui@latest add avatar progress separator skeleton tooltip
npx shadcn-ui@latest add table alert-dialog popover command
```

---

## 2. DESIGN SYSTEM & TOKENS

### Fonts
Load via `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
```

- **Display / headings:** `Sora` (weights: 600, 700)
- **Body / UI:** `DM Sans` (weights: 400, 500, 600)

### Tailwind config (`tailwind.config.ts`)
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde8ff',
          200: '#c3d4ff',
          300: '#9db5ff',
          400: '#7090ff',
          500: '#4361ee', // primary
          600: '#3047d4',
          700: '#2535ab',
          800: '#1e2b8a',
          900: '#1a2470',
          950: '#111640',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316', // amber accent
          600: '#ea6000',
        },
        success: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        warning: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        danger:  { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#080e1a',
        },
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
        'card-md': '0 4px 24px rgba(0,0,0,.08)',
        'brand':  '0 4px 24px rgba(67,97,238,.25)',
        'glow':   '0 0 0 3px rgba(67,97,238,.20)',
      },
      animation: {
        'fade-in':     'fadeIn .25s ease',
        'slide-up':    'slideUp .3s ease',
        'slide-right': 'slideRight .25s ease',
        'skeleton':    'skeleton 1.4s ease infinite',
        'pulse-dot':   'pulseDot 1.5s ease infinite',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        skeleton:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '.4' } },
        pulseDot:  { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' } },
      },
    },
  },
  plugins: [],
}
export default config
```

### CSS variables (`src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary:   #ffffff;
    --bg-secondary: #f8fafc;
    --bg-card:      #ffffff;
    --text-primary: #0f172a;
    --text-secondary:#475569;
    --text-muted:   #94a3b8;
    --border:       #e2e8f0;
    --sidebar-bg:   #0f172a;
    --sidebar-text: #cbd5e1;
    --sidebar-active: #4361ee;
  }
  .dark {
    --bg-primary:   #0f172a;
    --bg-secondary: #1e293b;
    --bg-card:      #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary:#94a3b8;
    --text-muted:   #64748b;
    --border:       #334155;
    --sidebar-bg:   #080e1a;
    --sidebar-text: #94a3b8;
    --sidebar-active: #4361ee;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }
  h1,h2,h3 { font-family: 'Sora', sans-serif; }
}
```

### Dark mode toggle
- Managed via `themeStore` (Zustand).
- Applies by adding/removing `dark` class on `<html>`.
- Persisted to `localStorage` key `"ef-theme"`.

---

## 3. FOLDER STRUCTURE

```
web/src/
├── main.tsx                   ← ReactDOM.createRoot, QueryClientProvider, Toaster
├── App.tsx                    ← All routes declared here
├── index.css
│
├── lib/
│   ├── supabase.ts            ← createClient
│   ├── utils.ts               ← cn(), formatDate(), formatCurrency(), truncate()
│   └── constants.ts           ← ROLES, QUIZ_TIME_LIMIT, MAX_FILE_SIZE, etc.
│
├── types/
│   └── index.ts               ← All shared TS interfaces (see §4)
│
├── stores/
│   ├── authStore.ts
│   ├── themeStore.ts
│   ├── notificationStore.ts
│   └── coursePlayerStore.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useCourses.ts
│   ├── useLessons.ts
│   ├── useEnrollments.ts
│   ├── useProgress.ts
│   ├── useQuiz.ts
│   ├── useMessages.ts
│   ├── useNotifications.ts
│   ├── useRealtime.ts
│   └── useUpload.ts
│
├── components/
│   ├── ui/                    ← shadcn/ui generated files
│   ├── shared/                ← App-level shared components
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleGuard.tsx
│   │   ├── PageTitle.tsx
│   │   ├── SkeletonCard.tsx
│   │   ├── SkeletonTable.tsx
│   │   ├── SkeletonList.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FileUploadZone.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StarRating.tsx
│   │   ├── CourseBadge.tsx
│   │   ├── UserAvatar.tsx
│   │   └── ConfirmDialog.tsx
│   │
│   ├── layout/
│   │   ├── PublicLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── StudentLayout.tsx
│   │   ├── InstructorLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── LessonLayout.tsx
│   │
│   ├── nav/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── PublicNavbar.tsx
│   │   └── MobileMenu.tsx
│   │
│   ├── course/
│   │   ├── CourseCard.tsx
│   │   ├── CourseGrid.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── CurriculumAccordion.tsx
│   │   ├── ReviewList.tsx
│   │   └── CourseCompletionModal.tsx
│   │
│   ├── lesson/
│   │   ├── VideoPlayer.tsx
│   │   ├── PDFViewer.tsx
│   │   ├── TextLesson.tsx
│   │   ├── LessonNav.tsx
│   │   └── NotesPanel.tsx
│   │
│   ├── quiz/
│   │   ├── QuizQuestion.tsx
│   │   ├── QuizTimer.tsx
│   │   ├── QuizNavigator.tsx
│   │   └── QuizResultScreen.tsx
│   │
│   ├── ai/
│   │   ├── AiTutorModal.tsx
│   │   ├── AiTutorButton.tsx
│   │   └── StreamingMessage.tsx
│   │
│   └── payment/
│       ├── PaymentModal.tsx
│       └── PricingCard.tsx
│
└── pages/
    ├── public/
    │   ├── Landing.tsx
    │   ├── Catalog.tsx
    │   └── CourseDetail.tsx
    │
    ├── auth/
    │   ├── Login.tsx
    │   ├── Signup.tsx
    │   ├── ForgotPassword.tsx
    │   ├── ResetPassword.tsx
    │   └── VerifyEmail.tsx
    │
    ├── student/
    │   ├── Dashboard.tsx
    │   ├── MyCourses.tsx
    │   ├── Grades.tsx
    │   ├── Progress.tsx
    │   ├── Certificates.tsx
    │   ├── Badges.tsx
    │   ├── Announcements.tsx
    │   └── Profile.tsx
    │
    ├── learn/
    │   ├── CoursePlayer.tsx      ← /learn/:courseId
    │   ├── LessonPage.tsx        ← /learn/:courseId/lesson/:lessonId
    │   ├── QuizPage.tsx          ← /learn/:courseId/quiz/:quizId
    │   └── AssignmentPage.tsx    ← /learn/:courseId/assignment/:assignmentId
    │
    ├── instructor/
    │   ├── Dashboard.tsx
    │   ├── CourseList.tsx
    │   ├── CourseCreate.tsx
    │   └── CourseEditor.tsx      ← /instructor/courses/:id (with tabs)
    │
    ├── admin/
    │   ├── Dashboard.tsx
    │   ├── Users.tsx
    │   ├── UserCreate.tsx
    │   ├── UserDetail.tsx
    │   ├── UserBulkImport.tsx
    │   ├── Courses.tsx
    │   ├── Analytics.tsx
    │   ├── Reports.tsx
    │   ├── Announcements.tsx
    │   ├── Settings.tsx
    │   └── AuditLogs.tsx
    │
    ├── shared/
    │   ├── Notifications.tsx
    │   ├── Messages.tsx
    │   └── Leaderboard.tsx
    │
    └── errors/
        ├── NotFound.tsx          ← 404
        └── Forbidden.tsx         ← 403
```

---

## 4. SHARED TYPES

**File: `src/types/index.ts`**

```ts
export type UserRole = 'student' | 'instructor' | 'admin'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonType = 'video' | 'pdf' | 'text'
export type QuestionType = 'mcq' | 'true_false'
export type SubmissionStatus = 'pending' | 'graded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  bio: string | null
  is_active: boolean
  created_at: string
  streak_count: number
  total_points: number
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  instructor_id: string
  instructor?: User
  category: string
  difficulty: DifficultyLevel
  price: number
  is_free: boolean
  status: CourseStatus
  rating: number
  rating_count: number
  student_count: number
  duration_hours: number
  created_at: string
  updated_at: string
  modules?: Module[]
}

export interface Module {
  id: string
  course_id: string
  title: string
  order_index: number
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  course_id: string
  title: string
  type: LessonType
  video_url: string | null
  pdf_url: string | null
  content: string | null      // HTML content for text lessons
  duration_seconds: number
  order_index: number
  is_preview: boolean
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  completed_at: string | null
  progress_percent: number
  course?: Course
}

export interface Progress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  completed_at: string
}

export interface Quiz {
  id: string
  course_id: string
  lesson_id: string | null
  title: string
  time_limit_seconds: number
  pass_score: number          // 0–100
  max_attempts: number
  questions?: Question[]
}

export interface Question {
  id: string
  quiz_id: string
  text: string
  type: QuestionType
  options: string[]           // array of option strings
  correct_index: number       // index into options[]
  explanation: string | null
  order_index: number
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  passed: boolean | null
  answers: Record<string, number>   // questionId → chosen index
}

export interface Assignment {
  id: string
  course_id: string
  lesson_id: string
  title: string
  description: string         // HTML from TipTap
  due_date: string | null
  max_points: number
}

export interface Submission {
  id: string
  assignment_id: string
  user_id: string
  content: string             // HTML
  file_urls: string[]
  submitted_at: string
  status: SubmissionStatus
  grade: number | null
  feedback: string | null
  student?: User
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  issued_at: string
  pdf_url: string
  verification_code: string
  course?: Course
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  condition_type: string      // 'enrollment_count'|'quiz_score'|'streak'|'course_complete'
  condition_value: number
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface PointEvent {
  id: string
  user_id: string
  points: number
  reason: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  sent_at: string
  read_at: string | null
  sender?: User
}

export interface Conversation {
  user: User
  last_message: Message
  unread_count: number
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'enrollment'|'grade'|'announcement'|'badge'|'message'|'system'
  read_at: string | null
  created_at: string
  link: string | null
}

export interface Announcement {
  id: string
  author_id: string
  course_id: string | null    // null = global
  title: string
  body: string                // HTML
  published_at: string
  author?: User
}

export interface Payment {
  id: string
  user_id: string
  course_id: string
  order_id: string
  payment_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  created_at: string
  course?: Course
}

export interface AdminSetting {
  key: string
  value: string
}

export interface AuditLog {
  id: string
  actor_id: string
  action: string
  table_name: string
  record_id: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
  actor?: User
}

export interface LeaderboardEntry {
  rank: number
  user: User
  total_points: number
  courses_completed: number
  streak: number
}

// API response wrappers
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// Zustand store shapes
export interface AuthState {
  user: User | null
  session: import('@supabase/supabase-js').Session | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: import('@supabase/supabase-js').Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}
```

---

## 5. SUPABASE CLIENT SETUP

**File: `src/lib/supabase.ts`**
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
```

**File: `src/lib/utils.ts`**
```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount)
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

export function secondsToDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
```

**File: `src/lib/constants.ts`**
```ts
export const ROLES = { STUDENT: 'student', INSTRUCTOR: 'instructor', ADMIN: 'admin' } as const
export const MAX_FILE_SIZE_MB = 500
export const MAX_VIDEO_SIZE_MB = 2048
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov']
export const ACCEPTED_PDF_TYPES = ['application/pdf']
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const LEADERBOARD_PAGE_SIZE = 20
export const QUIZ_WARN_SECONDS = 60   // show warning when 60s remain
export const AI_RATE_LIMIT_PER_HOUR = 20
```

---

## 6. GLOBAL STATE (ZUSTAND STORES)

### `src/stores/authStore.ts`
```ts
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { AuthState } from '../types'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
```

### `src/stores/themeStore.ts`
```ts
import { create } from 'zustand'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const stored = localStorage.getItem('ef-theme') as 'light' | 'dark' | null
const initial = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
document.documentElement.classList.toggle('dark', initial === 'dark')

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('ef-theme', next)
    set({ theme: next })
  },
}))
```

### `src/stores/notificationStore.ts`
```ts
import { create } from 'zustand'
import type { Notification } from '../types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (n: Notification[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
  addNotification: (n: Notification) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter(n => !n.read_at).length }),
  markRead: (id) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    set({ notifications: updated, unreadCount: updated.filter(n => !n.read_at).length })
  },
  markAllRead: () => {
    const updated = get().notifications.map(n => ({ ...n, read_at: new Date().toISOString() }))
    set({ notifications: updated, unreadCount: 0 })
  },
  addNotification: (n) => {
    const updated = [n, ...get().notifications]
    set({ notifications: updated, unreadCount: get().unreadCount + 1 })
  },
}))
```

### `src/stores/coursePlayerStore.ts`
```ts
import { create } from 'zustand'

interface CoursePlayerState {
  activeLessonId: string | null
  sidebarOpen: boolean
  notesOpen: boolean
  setActiveLesson: (id: string) => void
  toggleSidebar: () => void
  toggleNotes: () => void
}

export const useCoursePlayerStore = create<CoursePlayerState>((set) => ({
  activeLessonId: null,
  sidebarOpen: true,
  notesOpen: false,
  setActiveLesson: (activeLessonId) => set({ activeLessonId }),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleNotes: () => set(s => ({ notesOpen: !s.notesOpen })),
}))
```

---

## 7. ROUTING — ALL 40+ ROUTES

**File: `src/App.tsx`** — Register EVERY route on Day 1. Empty stub pages are acceptable until their phase is built. This prevents dead links.

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'sonner'
import ProtectedRoute from './components/shared/ProtectedRoute'
import RoleGuard from './components/shared/RoleGuard'
import SkeletonPage from './components/shared/SkeletonPage'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AuthLayout from './components/layout/AuthLayout'
import StudentLayout from './components/layout/StudentLayout'
import InstructorLayout from './components/layout/InstructorLayout'
import AdminLayout from './components/layout/AdminLayout'
import LessonLayout from './components/layout/LessonLayout'

// Lazy-loaded pages
const Landing        = lazy(() => import('./pages/public/Landing'))
const Catalog        = lazy(() => import('./pages/public/Catalog'))
const CourseDetail   = lazy(() => import('./pages/public/CourseDetail'))
const Login          = lazy(() => import('./pages/auth/Login'))
const Signup         = lazy(() => import('./pages/auth/Signup'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'))
const VerifyEmail    = lazy(() => import('./pages/auth/VerifyEmail'))

// Student pages
const StudentDashboard   = lazy(() => import('./pages/student/Dashboard'))
const MyCourses          = lazy(() => import('./pages/student/MyCourses'))
const Grades             = lazy(() => import('./pages/student/Grades'))
const Progress           = lazy(() => import('./pages/student/Progress'))
const StudentCerts       = lazy(() => import('./pages/student/Certificates'))
const StudentBadges      = lazy(() => import('./pages/student/Badges'))
const StudentAnnouncements = lazy(() => import('./pages/student/Announcements'))
const Profile            = lazy(() => import('./pages/student/Profile'))

// Learn pages
const CoursePlayer    = lazy(() => import('./pages/learn/CoursePlayer'))
const LessonPage      = lazy(() => import('./pages/learn/LessonPage'))
const QuizPage        = lazy(() => import('./pages/learn/QuizPage'))
const AssignmentPage  = lazy(() => import('./pages/learn/AssignmentPage'))

// Instructor pages
const InstructorDashboard = lazy(() => import('./pages/instructor/Dashboard'))
const InstructorCourses   = lazy(() => import('./pages/instructor/CourseList'))
const CourseCreate        = lazy(() => import('./pages/instructor/CourseCreate'))
const CourseEditor        = lazy(() => import('./pages/instructor/CourseEditor'))

// Admin pages
const AdminDashboard   = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers       = lazy(() => import('./pages/admin/Users'))
const UserCreate       = lazy(() => import('./pages/admin/UserCreate'))
const UserDetail       = lazy(() => import('./pages/admin/UserDetail'))
const UserBulkImport   = lazy(() => import('./pages/admin/UserBulkImport'))
const AdminCourses     = lazy(() => import('./pages/admin/Courses'))
const AdminAnalytics   = lazy(() => import('./pages/admin/Analytics'))
const AdminReports     = lazy(() => import('./pages/admin/Reports'))
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'))
const AdminSettings    = lazy(() => import('./pages/admin/Settings'))
const AuditLogs        = lazy(() => import('./pages/admin/AuditLogs'))

// Shared pages
const Notifications = lazy(() => import('./pages/shared/Notifications'))
const Messages      = lazy(() => import('./pages/shared/Messages'))
const Leaderboard   = lazy(() => import('./pages/shared/Leaderboard'))

// Errors
const NotFound  = lazy(() => import('./pages/errors/NotFound'))
const Forbidden = lazy(() => import('./pages/errors/Forbidden'))

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<SkeletonPage />}>{children}</Suspense>
)

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/"             element={<S><Landing /></S>} />
          <Route path="/catalog"      element={<S><Catalog /></S>} />
          <Route path="/catalog/:courseId" element={<S><CourseDetail /></S>} />
        </Route>

        {/* AUTH */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<S><Login /></S>} />
          <Route path="/signup"          element={<S><Signup /></S>} />
          <Route path="/forgot-password" element={<S><ForgotPassword /></S>} />
          <Route path="/reset-password"  element={<S><ResetPassword /></S>} />
          <Route path="/verify-email"    element={<S><VerifyEmail /></S>} />
        </Route>

        {/* LESSON PLAYER (fullscreen, own layout) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LessonLayout />}>
            <Route path="/learn/:courseId"                            element={<S><CoursePlayer /></S>} />
            <Route path="/learn/:courseId/lesson/:lessonId"           element={<S><LessonPage /></S>} />
            <Route path="/learn/:courseId/quiz/:quizId"               element={<S><QuizPage /></S>} />
            <Route path="/learn/:courseId/assignment/:assignmentId"   element={<S><AssignmentPage /></S>} />
          </Route>
        </Route>

        {/* STUDENT */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allow={['student']} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard"     element={<S><StudentDashboard /></S>} />
              <Route path="/student/courses"       element={<S><MyCourses /></S>} />
              <Route path="/student/grades"        element={<S><Grades /></S>} />
              <Route path="/student/progress"      element={<S><Progress /></S>} />
              <Route path="/student/certificates"  element={<S><StudentCerts /></S>} />
              <Route path="/student/badges"        element={<S><StudentBadges /></S>} />
              <Route path="/student/announcements" element={<S><StudentAnnouncements /></S>} />
              <Route path="/profile"               element={<S><Profile /></S>} />
              <Route path="/notifications"         element={<S><Notifications /></S>} />
              <Route path="/messages"              element={<S><Messages /></S>} />
              <Route path="/leaderboard"           element={<S><Leaderboard /></S>} />
            </Route>
          </Route>
        </Route>

        {/* INSTRUCTOR */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allow={['instructor', 'admin']} />}>
            <Route element={<InstructorLayout />}>
              <Route path="/instructor/dashboard"      element={<S><InstructorDashboard /></S>} />
              <Route path="/instructor/courses"        element={<S><InstructorCourses /></S>} />
              <Route path="/instructor/courses/new"    element={<S><CourseCreate /></S>} />
              <Route path="/instructor/courses/:id"    element={<S><CourseEditor /></S>} />
              <Route path="/notifications"             element={<S><Notifications /></S>} />
              <Route path="/messages"                  element={<S><Messages /></S>} />
            </Route>
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allow={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard"      element={<S><AdminDashboard /></S>} />
              <Route path="/admin/users"          element={<S><AdminUsers /></S>} />
              <Route path="/admin/users/new"      element={<S><UserCreate /></S>} />
              <Route path="/admin/users/bulk-import" element={<S><UserBulkImport /></S>} />
              <Route path="/admin/users/:id"      element={<S><UserDetail /></S>} />
              <Route path="/admin/courses"        element={<S><AdminCourses /></S>} />
              <Route path="/admin/analytics"      element={<S><AdminAnalytics /></S>} />
              <Route path="/admin/reports"        element={<S><AdminReports /></S>} />
              <Route path="/admin/announcements"  element={<S><AdminAnnouncements /></S>} />
              <Route path="/admin/settings"       element={<S><AdminSettings /></S>} />
              <Route path="/admin/audit-logs"     element={<S><AuditLogs /></S>} />
              <Route path="/notifications"        element={<S><Notifications /></S>} />
              <Route path="/messages"             element={<S><Messages /></S>} />
            </Route>
          </Route>
        </Route>

        {/* REDIRECTS */}
        <Route path="/dashboard" element={<RoleDashboardRedirect />} />

        {/* ERRORS */}
        <Route path="/403" element={<S><Forbidden /></S>} />
        <Route path="*"    element={<S><NotFound /></S>} />
      </Routes>
    </BrowserRouter>
  )
}

// Redirect /dashboard → correct role dashboard
function RoleDashboardRedirect() {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}
```

---

## 8. LAYOUTS (5 LAYOUTS)

### `ProtectedRoute.tsx`
Checks `authStore.session`. If `null` and `isLoading=false`, redirect to `/login?redirect=<current path>`.

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import SkeletonPage from '../shared/SkeletonPage'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()
  if (isLoading) return <SkeletonPage />
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  return <Outlet />
}
```

### `RoleGuard.tsx`
Props: `allow: UserRole[]`. If user role not in allow, redirect to `/403`.

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function RoleGuard({ allow }: { allow: string[] }) {
  const user = useAuthStore(s => s.user)
  if (!user || !allow.includes(user.role)) return <Navigate to="/403" replace />
  return <Outlet />
}
```

### `PublicLayout.tsx`
Structure: `<PublicNavbar /> + <main><Outlet /></main> + <Footer />`

**PublicNavbar** content:
- Logo: "EduFlow" in Sora font, brand-500 color, left side
- Nav links: Browse Courses → `/catalog`, For Instructors → `/signup?role=instructor`
- Right: if logged in → "Go to Dashboard" button; if not → "Log in" (ghost) + "Get started" (filled brand button)
- Sticky top, backdrop blur on scroll (`bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg`)
- Mobile: hamburger → full-screen drawer with same links

**Footer** content:
- Grid: Product links (Catalog, Become Instructor, Pricing), Company links (About, Blog, Careers), Legal links (Terms, Privacy)
- Bottom row: © 2025 EduFlow. Social icons: Twitter, LinkedIn, GitHub (Lucide icons)

### `AuthLayout.tsx`
Structure:
- Split screen: LEFT `w-[45%]` brand panel (dark brand-950 bg), RIGHT `w-[55%]` form panel
- Left panel: EduFlow logo, tagline "Learn without limits.", animated floating course cards (3 mock cards that float with CSS keyframes), testimonial quote at bottom
- Right panel: centered `max-w-sm` form area + `<Outlet />`
- Mobile: left panel hidden, right panel full width

### `StudentLayout.tsx`
Structure: `<Sidebar role="student" /> + <div className="flex-1 flex flex-col"><Topbar /> <main className="flex-1 overflow-y-auto p-6"><Outlet /></main></div>`

**Sidebar** (see §18 for full spec)
**Topbar** (see §18 for full spec)

### `InstructorLayout.tsx`
Same structure as StudentLayout but `<Sidebar role="instructor" />`

### `AdminLayout.tsx`
Same structure but `<Sidebar role="admin" />`. Admin sidebar is wider (`w-64`).

### `LessonLayout.tsx`
Fullscreen. No sidebar. Top bar: logo + course title + `<LessonNav />` + exit button back to `/student/courses`.

---

## 9. PHASE 1 — AUTH PAGES (5 PAGES)

### `onAuthStateChange` setup — `src/main.tsx`
```tsx
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'

function AuthInitializer() {
  const { setUser, setSession, setLoading } = useAuthStore()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        // Fetch profile from `profiles` table
        supabase.from('profiles').select('*').eq('id', data.session.user.id).single()
          .then(({ data: profile }) => { setUser(profile); setLoading(false) })
      } else {
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setUser(profile)
        // Role-based redirect after login
        if (event === 'SIGNED_IN') {
          const role = profile?.role
          const redirect = new URLSearchParams(window.location.search).get('redirect')
          window.location.href = redirect ?? (role === 'admin' ? '/admin/dashboard' : role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard')
        }
      } else {
        setUser(null)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])
  return null
}
```

---

### `/login` — `Login.tsx`

**Layout:** AuthLayout (split screen)

**Form fields:**
- Email (type="email", required)
- Password (type="password", required, show/hide toggle with Eye/EyeOff Lucide icon)

**Below fields:**
- "Forgot password?" link → `/forgot-password`
- Submit button: "Log in" (full width, brand-500)
- Divider: "or continue with"
- Google OAuth button (Google icon SVG + "Continue with Google")
- Bottom: "Don't have an account? [Sign up]" → `/signup`

**Validation (Zod):**
```ts
z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
```

**Supabase call:**
```ts
supabase.auth.signInWithPassword({ email, password })
// On error: show sonner toast.error(error.message)
// On success: onAuthStateChange handles redirect
```

**Google OAuth:**
```ts
supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } })
```

---

### `/signup` — `Signup.tsx`

**Form fields:**
- Full name (required)
- Email (required)
- Password (min 8 chars)
- Confirm password (must match)
- Role selector: two large radio cards — "I'm a Student" / "I'm an Instructor" (default: student)

**Validation (Zod):**
```ts
z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
  role: z.enum(['student', 'instructor']),
}).refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })
```

**Supabase call:**
```ts
// 1. Sign up
const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/verify-email' } })
// 2. Insert profile row
if (data.user) {
  await supabase.from('profiles').insert({ id: data.user.id, email, full_name, role })
}
// 3. Toast: "Check your email to verify your account"
// 4. Redirect to /verify-email
```

---

### `/forgot-password` — `ForgotPassword.tsx`

**Form fields:** Email only
**On submit:**
```ts
supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })
```
Show success state: "Reset link sent! Check your inbox." (replace form with success card, not toast)

---

### `/reset-password` — `ResetPassword.tsx`

**Fields:** New password + confirm password  
**On submit:**
```ts
supabase.auth.updateUser({ password: newPassword })
// On success: redirect to /login, toast.success('Password updated')
```

---

### `/verify-email` — `VerifyEmail.tsx`

Static confirmation page. Shows checkmark icon, "Please verify your email" heading, instructions, and a "Resend email" button that calls `supabase.auth.resend({ type: 'signup', email })`.

---

## 10. PHASE 2 — PUBLIC PAGES (3 PAGES)

### `/` — `Landing.tsx`

**Section 1 — Hero**
- Headline: "Learn Anything. Build Everything." (Sora, bold, 64px)
- Subline: "Join 10,000+ learners on EduFlow — the platform built for real skills."
- Two CTAs: "Browse Courses" (brand button → /catalog), "Become Instructor" (outlined → /signup?role=instructor)
- Background: animated gradient mesh (brand-500 to brand-800)
- Right side: floating mockup of the lesson player UI (decorative illustration using divs)

**Section 2 — Stats bar**
- 4 stats: `10,000+ Learners`, `500+ Courses`, `200+ Instructors`, `4.8★ Avg Rating`
- Thin horizontal strip, subtle border top/bottom

**Section 3 — Featured Courses**
- Heading: "Trending Courses"
- `useQuery` to fetch `SELECT * FROM courses WHERE status='published' ORDER BY student_count DESC LIMIT 8`
- `<CourseGrid />` with 4-col grid (responsive: 1→2→4)
- "View all courses" link → /catalog

**Section 4 — How it works**
- 3 columns: "Browse" / "Enroll" / "Learn & Earn" with icons and descriptions

**Section 5 — Pricing**
- 2 cards: Free plan vs Pro plan (₹499/month)
- Pro plan card has `ring-2 ring-brand-500` highlight

**Section 6 — Instructor CTA**
- Dark panel: "Turn Your Expertise Into Income" + CTA button

**Section 7 — Testimonials**
- 3 cards with avatar, name, quote, star rating (hardcoded or from DB)

**Footer** (from PublicLayout)

---

### `/catalog` — `Catalog.tsx`

**Layout:** 3-col grid on desktop — `FilterPanel` (left 1 col) + course grid (right 2 cols)

**URL params (all filter state lives in URL, not useState):**
- `?category=`, `?difficulty=`, `?price=free|paid`, `?rating=`, `?search=`, `?page=`
- Use `useSearchParams()` to read/write all filters

**FilterPanel component** (see §18):
- Category multiselect (checkboxes): Web Dev, Design, Data Science, Business, etc.
- Difficulty: Beginner / Intermediate / Advanced (radio)
- Price: All / Free / Paid (radio)
- Min rating: 4★ / 3★ / Any (radio)
- "Clear all filters" button

**Course grid:**
- `useQuery(['courses', filterParams], fetchCourses)`
- Supabase: `supabase.from('courses').select('*, instructor:profiles(*)').eq('status','published').filter(…).range(offset, offset+11)`
- Show `<SkeletonCard />` x 8 while loading
- Show `<EmptyState />` if no results
- Pagination: numbered pages (`<Pagination />` component)

**Top bar above grid:**
- Results count: "Showing 24 of 128 courses"
- Sort: dropdown (Newest / Most Popular / Highest Rated / Price: Low to High / Price: High to Low)

---

### `/catalog/:courseId` — `CourseDetail.tsx`

**Layout:** Two-column — content left, sticky CTA box right

**Left column content (top to bottom):**
1. Breadcrumb: Home > Catalog > [category]
2. Course title (h1, Sora 36px)
3. Tagline / short description
4. Meta row: `⭐ 4.8 (234 ratings)` · `👥 1,200 students` · `🕐 12.5 hours` · Difficulty badge
5. Instructor row: Avatar + name → instructor profile link
6. "Last updated: [date]"
7. Tabs: Overview | Curriculum | Instructor | Reviews

**Tab — Overview:**
- "What you'll learn" section (checklist)
- Full description (HTML from TipTap)
- Requirements list
- Who this is for

**Tab — Curriculum:**
- `<CurriculumAccordion />`: each Module is an accordion row; expanded = list of lessons with lock icon (locked if not enrolled) or play/pdf icon (if preview or enrolled)
- Show total lesson count + duration per module

**Tab — Instructor:**
- Instructor avatar, name, bio, # courses, # students, rating

**Tab — Reviews:**
- `<ReviewList />`: paginated, sortable, with score breakdown bar chart (5★ to 1★)
- Write review section (if enrolled + completed)

**Right column sticky CTA box:**
```
[Course thumbnail preview image]
₹2,499 (or FREE)
[Enroll Now / Buy Now] button — full width brand-500
───────────────────────
✓ 12.5 hours of video
✓ Certificate on completion
✓ Lifetime access
✓ Mobile access
```
- "Enroll Now" onClick: if user not logged in → `navigate('/login?redirect=/catalog/'+courseId)`. If free → `POST enrollments`. If paid → open `<PaymentModal />`.

---

## 11. PHASE 3 — STUDENT CORE LEARNING (6 PAGES)

### `/student/dashboard` — `StudentDashboard.tsx`

**Top: Welcome row** — "Good morning, [first name]! 🌟" + streak counter (fire emoji + N days)

**Quick stats row (4 KPI cards):**
| Card | Data |
|---|---|
| Courses enrolled | `COUNT enrollments WHERE user_id=me` |
| Lessons completed | `COUNT progress WHERE user_id=me` |
| Avg quiz score | `AVG quiz_attempts.score WHERE user_id=me` |
| Total points | `profiles.total_points` |

**Continue Learning section:**
- Heading "Pick up where you left off"
- 3 course cards, each showing: thumbnail, title, `<ProgressBar value={progress_percent} />`, "Continue" button → `/learn/:courseId/lesson/:lastLessonId`
- Data: `SELECT enrollments JOIN courses WHERE completed_at IS NULL ORDER BY last_accessed DESC LIMIT 3`

**Upcoming deadlines:**
- Table: Assignment title | Course | Due date | Status (Submitted / Pending)
- Rows clickable → `/learn/:courseId/assignment/:assignmentId`

**Streak calendar:**
- 7 × N grid of day squares for the past 4 weeks
- Filled (brand-500) if `daily_check_ins` has a row for that day, gray otherwise
- "Current streak: 7 days 🔥"

**Announcements (latest 3):**
- Card list with title, course name, date, "Read more" → `/student/announcements`

---

### `/student/courses` — `MyCourses.tsx`

**Tabs:** In Progress | Completed | Archived (via URL param `?tab=`)

**Each course card shows:**
- Thumbnail
- Title + instructor name
- `<ProgressBar />`
- Badge: "% complete"
- Action button: "Continue" or "Review" (if completed)
- Three-dot menu: View Certificate (if completed), Hide course

**Empty state:** If no courses, show: "No courses yet! [Browse catalog]" CTA

---

### `/learn/:courseId` — `CoursePlayer.tsx`

This is the course overview/landing before entering a specific lesson.

**Content:**
- Course header: thumbnail, title, progress bar
- Module accordion list: clicking a lesson navigates to `/learn/:courseId/lesson/:lessonId`
- Lesson rows show: icon (video/pdf/text), title, duration, ✓ if completed

**Store:** `useCoursePlayerStore` - set `activeLessonId` to first incomplete lesson.

---

### `/learn/:courseId/lesson/:lessonId` — `LessonPage.tsx`

**Layout:** `LessonLayout` — fullscreen, no standard sidebar.

**UI structure:**
```
[Topbar: logo | course title | notes toggle | sidebar toggle | exit]
─────────────────────────────────────────────────────────────────────
[Main area: 75% width]    │   [Sidebar: 25%, collapsible]
  VideoPlayer / PDFViewer │   Module + lesson list (same as CoursePlayer)
  / TextLesson            │   With ✓ checkmarks
─────────────────────────────────────────────────────────────────────
[Bottom nav: ← Prev | Mark Complete | Next →]
```

**If `notesOpen` (from store):** overlay panel slides in from right, contains TipTap editor (minimal toolbar: bold, italic, bullet list). Notes autosaved to Supabase `notes` table on 500ms debounce.

**VideoPlayer:** `<video>` element with custom controls overlay. Supabase Storage signed URL. Track `currentTime` and mark complete when 90%+ watched.

**PDFViewer:** `<iframe>` with Supabase Storage signed PDF URL. Add "Download" button.

**TextLesson:** Render `lesson.content` as HTML via `dangerouslySetInnerHTML`. Style with `prose` class.

**"Mark Complete" button:**
```ts
supabase.from('progress').upsert({ user_id, lesson_id, course_id, completed_at: new Date().toISOString() })
// Then navigate to next lesson automatically
```

**On course completion (last lesson marked complete):**
- Show `<CourseCompletionModal />` with confetti
- Trigger certificate generation (Edge Function call)

---

### `/learn/:courseId/quiz/:quizId` — `QuizPage.tsx`

**Critical: timer persists across refresh.**

**On mount:**
```ts
// 1. Check for existing quiz_attempt
const { data: attempt } = await supabase.from('quiz_attempts')
  .select('*').eq('quiz_id', quizId).eq('user_id', userId)
  .is('submitted_at', null).single()

if (attempt) {
  // Resume: compute remaining = time_limit_seconds - (now - started_at)
  setRemainingSeconds(computed)
  setAnswers(attempt.answers)
  setAttemptId(attempt.id)
} else {
  // New attempt: INSERT quiz_attempts with started_at=now
  const { data } = await supabase.from('quiz_attempts').insert({
    user_id, quiz_id, started_at: new Date().toISOString(), answers: {}
  }).select().single()
  setAttemptId(data.id)
  setRemainingSeconds(quiz.time_limit_seconds)
}
```

**Timer:** `setInterval` every 1 second. When reaches 0 → auto-submit. Show warning when ≤ `QUIZ_WARN_SECONDS` (amber timer color + pulsing dot).

**Layout:**
```
[QuizTimer — top right]
─────────────────────────────────────────────────────
[Question text — large, centered]
[Options: A / B / C / D — radio-style cards]
─────────────────────────────────────────────────────
[QuizNavigator — bottom: numbered squares, gray=unanswered, brand=answered]
[← Previous] [Next →]           [Submit Quiz]
```

**On answer select:**
```ts
// UPSERT answers immediately to DB (so refresh restores)
await supabase.from('quiz_attempts').update({ answers: updatedAnswers }).eq('id', attemptId)
```

**On submit (Edge Function):**
```ts
const { data } = await supabase.functions.invoke('grade-quiz', { body: { attempt_id: attemptId } })
// Edge Function grades MCQs, writes score to quiz_attempts, returns score + passed
```

**QuizResultScreen:** Score circle, pass/fail badge, per-question review (correct answer highlighted green, wrong highlighted red + explanation shown). "Try again" (if max_attempts not reached) or "Back to course".

---

### `/learn/:courseId/assignment/:assignmentId` — `AssignmentPage.tsx`

**If not yet submitted:**
- Assignment title + description (rendered HTML)
- Due date + max points displayed
- TipTap editor for written response (full toolbar: bold, italic, headings, lists, links, images)
- `<FileUploadZone />` — supports multiple files → Supabase Storage bucket `submissions/`
- Upload progress bar per file (using XMLHttpRequest for progress events)
- "Submit Assignment" button

**Submission logic:**
```ts
// 1. Upload files → get urls
// 2. INSERT submissions({ assignment_id, user_id, content, file_urls, submitted_at })
// 3. Redirect to /student/grades + toast.success
```

**If already submitted:** show read-only view of submission. If graded: show grade/100, feedback (HTML), instructor name.

---

## 12. PHASE 4 — STUDENT EXTENDED (8 PAGES)

### `/student/grades` — `Grades.tsx`

**Table columns:** Course | Assignment | Submitted | Grade | Status | Actions

**Actions per row:** View feedback (sheet/drawer), Download PDF grade report

**Filter bar:** by course (select), status (pending/graded)

**Bottom:** "Download full grade report (CSV)" button — calls Edge Function `generate-grade-report`, returns CSV blob, downloads via `<a download>`.

**Skeleton:** `<SkeletonTable rows={8} cols={6} />`

---

### `/student/progress` — `Progress.tsx`

**Section 1 — Overall stats row:**
- Total courses enrolled, completed, in progress
- Total learning time (hours) from `progress` table

**Section 2 — Score over time (Recharts LineChart):**
- X-axis: date, Y-axis: quiz score
- Data: `SELECT quiz_attempts.submitted_at, score ORDER BY submitted_at`
- Line color: brand-500, tooltip with score + quiz name

**Section 3 — Time spent per course (Recharts BarChart):**
- Horizontal bars, one per enrolled course
- Data: computed from video watch time logs

**Section 4 — Weekly activity heatmap:**
- 52-week GitHub-style contribution grid
- Color intensity = lessons completed that day

---

### `/student/certificates` — `Certificates.tsx`

**Grid layout:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

**Each certificate card:**
- Course thumbnail background
- "Certificate of Completion" text overlay
- Course name, date issued
- Verification code (monospace, small)
- Buttons: "Download PDF" (GET signed URL from Supabase Storage), "Share" (dropdown: copy link, LinkedIn, Twitter)

**"Download PDF":** `window.open(certificate.pdf_url, '_blank')`

**Empty state:** "Complete a course to earn your first certificate!" with illustration.

---

### `/student/badges` — `Badges.tsx`

**Layout:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6`

**Each badge:**
- If earned: colored icon image + badge name + "Earned [date]" — full opacity
- If locked: grayscale filter (`grayscale opacity-40`) + lock icon overlay
- Hover: tooltip with badge description + how to unlock

**Sections:** Earned first, then locked

**Points history** (below badge grid):
- Table: Date | Event | Points earned
- `SELECT * FROM point_events WHERE user_id=me ORDER BY created_at DESC LIMIT 20`

---

### `/student/announcements` — `Announcements.tsx`

**Filter:** All / Course-specific (dropdown)

**Each announcement card:**
- Title, author avatar + name, course name (or "Global"), date
- Body preview (truncated to 2 lines)
- Click → expand in-place or open sheet

---

### `/notifications` — `Notifications.tsx`

**Shared page — used across all roles.**

**Top bar:** "Notifications" heading + "Mark all as read" button

**List:** Each item:
- Icon by type (enrollment=BookOpen, grade=Award, badge=Star, message=MessageCircle, announcement=Megaphone, system=Bell)
- Title + body
- Date (relative: "2 hours ago")
- Unread = `bg-brand-50 dark:bg-brand-950/30` background
- Click → navigate to `notification.link` + mark as read

**Realtime:** subscribe to `notifications` channel filtered by `user_id=me` (see §20).

---

### `/messages` — `Messages.tsx`

**Shared page — used across all roles.**

**Layout:** Split panel
- Left (1/3): Conversation list — each row: avatar, name, last message truncated, unread badge, timestamp
- Right (2/3): Active conversation — message bubbles, input

**Message bubbles:**
- Sent (right, brand-500 bg)
- Received (left, surface-100 bg)
- Timestamp below each bubble (small, muted)

**Input:** text input + send button. On Enter or click: `INSERT messages({ sender_id, receiver_id, content })`. Realtime channel updates both users instantly.

**Realtime:** subscribe to messages channel filtered by `or(sender_id.eq.me,receiver_id.eq.me)`.

---

### `/leaderboard` — `Leaderboard.tsx`

**Shared page — used across all roles.**

**Top 3 podium:** Special podium design for rank 1, 2, 3 with larger avatars, crown icon for #1.

**Table (rank 4+):**
Columns: Rank | User (avatar + name) | Points | Courses Completed | Streak

**My rank row:** sticky, highlighted in `bg-brand-50` even if off-screen (always visible at bottom of table).

**Pagination:** 20 per page.

**Data:** `SELECT profiles.*, SUM(point_events.points) as total_points, COUNT(DISTINCT enrollments) as courses_completed ORDER BY total_points DESC`.

---

### `/profile` — `Profile.tsx`

**Tabs:** Profile | Account | Payments

**Tab — Profile:**
- Avatar upload: click avatar → file picker → upload to Supabase Storage `avatars/` → `UPDATE profiles SET avatar_url`
- Full name, bio (textarea), social links
- Save button

**Tab — Account:**
- Change email (requires re-auth)
- Change password form
- "Delete account" danger zone (confirm dialog)

**Tab — Payments:**
- Table: Course | Amount | Date | Status
- `SELECT * FROM payments WHERE user_id=me ORDER BY created_at DESC`

---

## 13. PHASE 5 — INSTRUCTOR FEATURES (4 PAGES)

### `/instructor/dashboard` — `InstructorDashboard.tsx`

**KPI cards (4):**
- Total revenue this month (₹)
- Total enrolled students
- Published courses count
- Avg course rating

**Revenue chart (Recharts AreaChart):** Monthly revenue last 12 months.

**Recent submissions table:** Student name | Course | Assignment | Submitted | Action (Grade)

**Top performing courses:** 3 cards with enrollment count + rating

---

### `/instructor/courses` — `InstructorCourseList.tsx`

**Table columns:** Thumbnail | Title | Status badge | Students | Rating | Revenue | Actions

**Status badge:** `draft` (gray) | `published` (green) | `archived` (orange)

**Actions per row:** Edit → `/instructor/courses/:id` | Publish/Unpublish (PATCH status) | Delete (confirm dialog)

**Top right:** "Create new course" button → `/instructor/courses/new`

---

### `/instructor/courses/new` — `CourseCreate.tsx`

**3-step wizard:**

**Step 1 — Basic Info:**
- Course title (required)
- Category (select)
- Difficulty (select)
- Short description (textarea, max 200 chars)
- Full description (TipTap editor)
- Thumbnail upload → Supabase Storage `thumbnails/`

**Step 2 — Pricing:**
- Toggle: Free / Paid
- If paid: price field (₹), optional sale price
- Preview of course card with pricing

**Step 3 — Review:**
- Summary of all info
- "Save as Draft" (default) or "Publish immediately" (checkbox)
- Submit: `INSERT courses` → redirect to `/instructor/courses/:id`

---

### `/instructor/courses/:id` — `CourseEditor.tsx`

**Tabs:** Content | Quizzes | Assignments | Gradebook | Settings | Students

**Tab — Content:**

Module builder:
- "Add module" button → inline input to add module title
- Modules listed in order, each collapsible
- Drag handle (⠿) for reorder via dnd-kit — on drop: `PATCH modules SET order_index` for all affected rows
- Each module: "Add lesson" button + lesson list

Lesson list per module (also draggable):
- Each lesson row: type icon | title | duration | edit (pencil) | delete
- "Add lesson" → opens `<AddLessonModal />`

**AddLessonModal:**
- Lesson title
- Type select: Video / PDF / Text
- If Video: `<FileUploadZone accept="video/*" maxMB={2048} />` → Supabase Storage resumable upload (tus). Show upload progress. After upload: set `lesson.video_url`
- If PDF: `<FileUploadZone accept=".pdf" />` → Supabase Storage. Set `lesson.pdf_url`
- If Text: TipTap editor
- Is preview (free) toggle
- Save → `INSERT lessons` with `order_index = max + 1`

**Tab — Quizzes:**
- Quiz list with "Add quiz" button
- Each quiz expandable → shows questions
- "Add question" → `<QuestionBuilderRow>`: question text, type (MCQ/T-F), options (add/remove), correct answer radio, explanation
- Drag questions to reorder (dnd-kit)
- `<QuizSettingsModal>`: time limit, pass score, max attempts
- All changes: immediate PATCH to DB

**Tab — Assignments:**
- Assignment list
- "Add assignment" → form: title, description (TipTap), due date, max points, rubric (TipTap)

**Tab — Gradebook:**
- Table: Student | Assignment | Submitted | Grade (editable cell) | Feedback
- Click grade cell → inline input
- "Save grade" → `PATCH submissions SET grade, feedback, status='graded'`
- Sonner toast on save
- "Batch grade" mode: checkbox select multiple → apply same grade
- "Export CSV" button

**Tab — Students:**
- Table: Student name | Enrolled date | Progress % | Last active
- `<StudentDetailModal />`: on row click → show full student progress within this course
- "Invite student" → `<InviteStudentModal>`: email input → send invite via Edge Function `send-invite-email`

**Tab — Settings:**
- Edit title, category, difficulty, description, thumbnail
- Danger zone: Archive course (soft delete: `PATCH status='archived'`), Delete course (with confirm — only if 0 enrollments)

---

## 14. PHASE 6 — ADMIN FEATURES (11 PAGES)

### `/admin/dashboard` — `AdminDashboard.tsx`

**KPI cards (6):**
- Total users | New users this week
- Total courses | Published courses
- Total revenue | Revenue this month

**Charts:**
- User growth (Recharts LineChart — daily new signups, last 30 days)
- Revenue trend (Recharts AreaChart — monthly, last 12 months)
- Enrollment by category (Recharts PieChart)
- Active users heatmap (day-of-week × hour grid)

**Recent audit log** (last 10 entries): actor | action | table | timestamp

---

### `/admin/users` — `AdminUsers.tsx`

**Top bar:**
- Search input (debounced 300ms → updates query)
- Filter by role (All / Student / Instructor / Admin)
- Filter by status (Active / Inactive)
- "Add user" button → `/admin/users/new`
- "Bulk import" button → `/admin/users/bulk-import`

**Table columns:** Avatar+name | Email | Role badge | Status | Joined | Actions

**Bulk actions:** Checkbox select → bulk action dropdown: Activate, Deactivate, Change role, Export selected

**Actions per row:** View → `/admin/users/:id` | Edit role (popover select) | Deactivate/Reactivate | Delete (confirm)

**Pagination:** 25 per page

**Skeleton:** `<SkeletonTable rows={10} cols={6} />`

---

### `/admin/users/new` — `UserCreate.tsx`

Form: full name, email, role, send welcome email toggle (calls Resend via Edge Function).
On submit: `supabase.auth.admin.createUser()` via Edge Function (needs service_role key), then INSERT profiles.

---

### `/admin/users/bulk-import` — `UserBulkImport.tsx`

**Step 1:** Download CSV template button (generates CSV with columns: `full_name,email,role`)

**Step 2:** `<FileUploadZone accept=".csv" />` — parse CSV client-side with PapaParse, show preview table (first 10 rows)

**Step 3:** Column mapping UI — if CSV headers differ, let admin map which column → which field

**Step 4:** Validation preview — flag rows with invalid emails, missing fields. Show "X rows valid, Y rows invalid"

**Step 5:** "Import N valid users" button → POST to Edge Function `bulk-import-users` (uses service_role). Show progress (SSE stream from Edge Function). Summary: "Created: 48, Skipped: 2 (already exist)"

---

### `/admin/users/:id` — `UserDetail.tsx`

**Header:** Avatar + name + role badge + active/inactive toggle + "Impersonate" button

**Impersonate:** Calls Edge Function `impersonate-user` which generates a short-lived JWT. Stores original admin session in `sessionStorage`. Show persistent banner: "You're viewing as [name] [Stop impersonating]". Stop: restore admin JWT from sessionStorage.

**Tabs:** Overview | Courses | Submissions | Payments | Activity

**Overview tab:** All profile fields, editable, save button

**Courses tab:** All enrollments with progress

**Submissions tab:** All assignment submissions

**Payments tab:** All payment records

**Activity tab:** Recent audit log entries for this user

---

### `/admin/courses` — `AdminCourses.tsx`

**Same as instructor course list but for ALL courses.** Additional columns: Instructor name. Additional actions: Feature course (toggles `is_featured`), Move to different instructor (popover search). Admins can publish/unpublish any course.

---

### `/admin/analytics` — `AdminAnalytics.tsx`

**Date range picker:** Last 7d / 30d / 90d / Custom (two date inputs)

**Charts:**
- Daily active users (LineChart)
- New enrollments per day (BarChart)
- Revenue per day (AreaChart)
- Top 10 courses by enrollment (HorizontalBarChart)
- Quiz pass rates by course (BarChart)
- Average completion rate by category (RadialBarChart)

All charts respond to date range filter via re-query.

---

### `/admin/reports` — `AdminReports.tsx`

**Report types (each a card with "Generate" button):**

| Report | Description | Format |
|---|---|---|
| User export | All users with role, status, join date | CSV |
| Enrollment report | All enrollments with course, student, date | CSV |
| Revenue report | All payments with amounts, dates | CSV |
| Quiz performance | Avg scores per quiz | CSV |
| Completion rates | % completion per course | CSV |

"Generate" → calls Edge Function `generate-report` with type param → returns CSV blob → `<a download>` trigger.

---

### `/admin/announcements` — `AdminAnnouncements.tsx`

**List of all announcements** with edit/delete.

**Create announcement:**
- Title
- Target: All users / Specific course (course search dropdown)
- Body (TipTap editor)
- "Publish" → `INSERT announcements` + triggers Resend email via Edge Function to all target users

---

### `/admin/settings` — `AdminSettings.tsx`

**Tabs:**

**General tab:** Platform name, platform logo (upload), support email, timezone

**Auth tab:** Allow student self-registration (toggle), require email verification (toggle), Google OAuth enabled (toggle)

**Email tab:** Test send email button, email footer text

**Payments tab:** Razorpay test/production mode toggle, Razorpay key ID (masked input), currency

**Notifications tab:** Default notification channels (email / in-app / push)

All settings: `PATCH admin_settings SET value WHERE key=...` via Edge Function (service_role needed for some).

---

### `/admin/audit-logs` — `AuditLogs.tsx`

**Filters:** Actor (user search), Action (dropdown), Table name (dropdown), Date range

**Table columns:** Timestamp | Actor | Action | Table | Record ID | Changes (diff icon)

**Changes column:** Click diff icon → sheet opens showing JSON diff (`old_data` vs `new_data`) formatted as a colorized diff (added=green, removed=red)

**Pagination:** 50 per page

---

## 15. PHASE 7 — AI FEATURES (3 MODALS/OVERLAYS)

### AI Tutor — `AiTutorModal.tsx`

**Trigger:** Floating action button (`<AiTutorButton />`) — fixed bottom-right on all logged-in pages. Renders as a pulsing purple circular button with robot/sparkles icon.

**Modal:** Slides up from bottom-right (not full screen — `w-[400px] h-[550px]` panel)

**Header:** "EduFlow AI Tutor" + current course name (if on a lesson page, inject course context)

**Chat area:** Scrollable. Each message:
- User: right-aligned, brand-500 bg
- AI: left-aligned, surface-100 bg, renders markdown (use react-markdown)
- AI messages stream in token by token (`<StreamingMessage />` component)

**Input:** Text input + Send button. On send:

```ts
// 1. Add user message to UI immediately
// 2. Add empty AI message with loading dots
// 3. Call Edge Function with streaming
const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, course_id: activeCourseId, history: messages.slice(-10) }),
})
// 4. Read ReadableStream, append chunks to AI message
const reader = response.body.getReader()
const decoder = new TextDecoder()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value)
  appendToLastMessage(chunk)
}
```

**Rate limit feedback:** If Edge Function returns 429, show "You've reached the hourly AI limit. Try again later."

---

### Quiz Generator — in `CourseEditor.tsx` Tab "Quizzes"

**"Generate quiz with AI" button** → modal:
- Select lesson (dropdown of lessons in this course)
- Number of questions (slider: 3–20)
- Difficulty (Easy / Medium / Hard)
- "Generate" → POST to Edge Function `ai-generate-quiz`
- Show loading spinner (takes 3–8s)
- Return: array of `Question` objects
- Preview: list of generated questions with checkboxes (deselect any you don't want)
- "Add selected to quiz" → bulk INSERT questions

---

### Lesson Summarizer — in `LessonPage.tsx`

**"Summarize with AI" button** (in lesson topbar, only for text lessons):
- POST to Edge Function `ai-summarize-lesson` with `lesson_id`
- Response streams into a collapsible panel below the lesson content
- "Hide summary" toggle

---

## 16. PHASE 8 — CERTIFICATES, BADGES & GAMIFICATION

### Certificates (already specified in §12 `/student/certificates`)

**Generation flow:**
- Triggered by DB trigger on `progress` table: when `COUNT(progress WHERE course_id=X AND user_id=Y) = COUNT(lessons WHERE course_id=X)` → call Edge Function `generate-certificate`
- Edge Function: creates PDF (jsPDF), uploads to Supabase Storage `certificates/{user_id}/{course_id}.pdf`, inserts `certificates` row with `pdf_url` + random `verification_code`
- Frontend polls or listens via Realtime for new certificate row

### Badges — `UserBadges.tsx` (already in §12)

**Badge rules engine (Edge Function `check-badges`):**
Called after: quiz submit, lesson complete, enrollment, streak update.
Conditions checked:
- `first_enrollment`: earned when `COUNT(enrollments WHERE user_id=me) = 1`
- `course_completer`: earned when any course has 100% progress
- `quiz_ace`: earned when any quiz_attempt has score = 100
- `streak_7`: earned when `streak_count >= 7`
- `top_student`: earned when leaderboard rank <= 10
On condition met: `INSERT user_badges` + `INSERT notifications` (badge earned notification)

### Points system

Points awarded:
| Event | Points |
|---|---|
| Complete lesson | +5 |
| Pass quiz | +20 |
| Score 100% on quiz | +50 |
| Submit assignment | +10 |
| Complete course | +100 |
| Daily login streak | +2 per day |

Frontend: after any of these events, refetch `profiles.total_points` and animate the count update.

### Streak

On every login/lesson view:
```ts
// Edge Function or DB function:
const today = new Date().toISOString().split('T')[0]
await supabase.from('daily_checkins').upsert({ user_id, date: today })
// Then compute streak: count consecutive days ending today
await supabase.rpc('compute_streak', { p_user_id: userId })
// Returns: current_streak number → UPDATE profiles SET streak_count
```

---

## 17. PHASE 9 — PAYMENTS (RAZORPAY)

### `PaymentModal.tsx`

**Trigger:** "Buy Now" on CourseDetail, or any locked course CTA.

**Props:** `course: Course`

**Step 1 — Order creation:**
```ts
const { data } = await supabase.functions.invoke('create-order', {
  body: { course_id: course.id, amount: course.price }
})
// Returns: { order_id, amount, currency, key_id }
```

**Step 2 — Razorpay checkout:**
```ts
// Load Razorpay script dynamically
const script = document.createElement('script')
script.src = 'https://checkout.razorpay.com/v1/checkout.js'
document.body.appendChild(script)
script.onload = () => {
  const rzp = new (window as any).Razorpay({
    key: data.key_id,
    order_id: data.order_id,
    amount: data.amount,
    currency: data.currency,
    name: 'EduFlow',
    description: course.title,
    image: '/logo.png',
    prefill: { name: user.full_name, email: user.email },
    theme: { color: '#4361ee' },
    handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
      // Step 3: verify payment
      await verifyPayment(response)
    },
  })
  rzp.open()
}
```

**Step 3 — Verification (Edge Function):**
```ts
const { data: result } = await supabase.functions.invoke('verify-payment', {
  body: {
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature,
    course_id: course.id,
  }
})
if (result.success) {
  toast.success('Enrolled successfully!')
  navigate(`/learn/${course.id}`)
} else {
  toast.error('Payment verification failed. Contact support.')
}
```

**NEVER trust the frontend payment success.** The Edge Function must verify the Razorpay signature before enrolling.

### Payment history in `/profile` Tab — Payments (already specified in §12)

---

## 18. SHARED COMPONENT LIBRARY

Spec for every shared component. Build these early — they are used everywhere.

### `Sidebar.tsx`

**Props:** `role: 'student' | 'instructor' | 'admin'`

**Structure:**
```
┌─────────────────────────┐
│ Logo + "EduFlow"        │
│ ─────────────────────── │
│  [nav items]            │
│                         │
│  (spacer flex-1)        │
│ ─────────────────────── │
│  [user avatar + name]   │
│  [theme toggle]         │
│  [sign out]             │
└─────────────────────────┘
```

**Width:** `w-64`, dark sidebar (`bg-surface-900 dark:bg-surface-950`), fixed height `h-screen sticky top-0`

**Nav items by role:**

Student:
```
BookOpen  My Courses          /student/courses
LayoutDashboard Dashboard     /student/dashboard
BarChart2 Progress            /student/progress
Award     Certificates        /student/certificates
Star      Badges              /student/badges
Trophy    Leaderboard         /leaderboard
MessageCircle Messages        /messages
Bell      Notifications       /notifications  [unread badge]
Megaphone Announcements       /student/announcements
User      Profile             /profile
```

Instructor:
```
LayoutDashboard Dashboard     /instructor/dashboard
BookOpen  My Courses          /instructor/courses
MessageCircle Messages        /messages
Bell      Notifications       /notifications  [unread badge]
User      Profile             /profile
```

Admin:
```
LayoutDashboard Dashboard     /admin/dashboard
Users     Users               /admin/users
BookOpen  Courses             /admin/courses
BarChart2 Analytics           /admin/analytics
FileText  Reports             /admin/reports
Megaphone Announcements       /admin/announcements
Bell      Notifications       /notifications  [unread badge]
MessageCircle Messages        /messages
Settings  Settings            /admin/settings
Shield    Audit Logs          /admin/audit-logs
```

**Active state:** `bg-brand-500/10 text-brand-400 border-r-2 border-brand-500`
**Inactive state:** `text-slate-400 hover:bg-white/5 hover:text-white`

**Mobile:** sidebar hidden on mobile, use drawer (`Sheet` from shadcn/ui), triggered by hamburger in Topbar.

---

### `Topbar.tsx`

**Structure (left to right):**
- Hamburger icon (mobile) → opens mobile sidebar drawer
- Page title (from `<PageTitle />` context or React Helmet)
- Spacer (flex-1)
- Search button (opens full-screen search overlay)
- Theme toggle (Sun/Moon icon)
- Notification bell + unread count badge (red dot) → `/notifications`
- User avatar → profile dropdown:
  - "[Full name]" header
  - View Profile → `/profile`
  - My Courses → `/student/courses` (or equivalent for role)
  - Sign out

**Search overlay (triggered by search icon):**
- Full-screen overlay with centered search input
- Results appear as you type (debounced 300ms)
- Result types: courses, lessons, users (admin)
- Keyboard: ESC to close, Arrow keys to navigate, Enter to go

---

### `CourseCard.tsx`

**Props:** `course: Course`, `showProgress?: boolean`, `progressPercent?: number`

**Visual:**
```
┌──────────────────────────┐
│  [thumbnail 16:9]        │
│  [difficulty badge TL]   │
├──────────────────────────┤
│  Category · Duration     │
│  Title (2 lines max)     │
│  Instructor name         │
│  ★★★★½  4.8 (234)        │
│  [progress bar if shown] │
│  ₹2,499  OR  FREE        │
└──────────────────────────┘
```

Card is `cursor-pointer` and navigates to `/catalog/:courseId` on click.
Hover: subtle scale transform `hover:scale-[1.02]` + shadow increase.

---

### `FilterPanel.tsx`

**Props:** No props — reads/writes `useSearchParams()`

Sections:
- Search input at top
- Category (multiselect checkboxes)
- Difficulty (radio: All / Beginner / Intermediate / Advanced)
- Price (radio: All / Free / Paid)
- Rating (radio: Any / 3★ & up / 4★ & up)
- "Clear all" button (only visible if any filter active)

On any change: `setSearchParams(...)` with all active filters.

---

### `CurriculumAccordion.tsx`

**Props:** `modules: Module[]`, `isEnrolled: boolean`, `completedLessonIds: string[]`

Accordion rows for each module. Inside: lesson list. Each lesson:
- Icon: video/pdf/text based on type
- Title
- Duration
- Lock icon if `!isEnrolled && !lesson.is_preview`
- Checkmark if `completedLessonIds.includes(lesson.id)`
- Click: if locked → `toast.info('Enroll to access')`, else navigate to lesson

---

### `FileUploadZone.tsx`

**Props:** `accept: string`, `maxMB: number`, `onUpload: (urls: string[]) => void`, `multiple?: boolean`

**UI:** Dashed border box with upload icon + "Drag files here or click to browse". Shows file list with size and progress bar per file. Remove (×) per file before upload. Error if file too large.

**Upload via Supabase Storage with progress:**
```ts
// For videos use resumable uploads via tus:
import * as tus from 'tus-js-client'
// For other files: supabase.storage.from('bucket').upload(path, file)
// Track progress via onProgress callback
```

---

### `SkeletonCard.tsx` / `SkeletonTable.tsx` / `SkeletonList.tsx`

All use Tailwind's `animate-pulse` + rounded gray blocks. Shapes match the real component exactly (course card skeleton = same dimensions as CourseCard).

---

### `EmptyState.tsx`

**Props:** `icon: LucideIcon`, `title: string`, `description: string`, `action?: { label: string; href: string }`

Centered illustration + icon + text + optional CTA button.

---

### `ErrorBoundary.tsx`

React class component wrapping every route. On error: shows a friendly error card with "Try again" (reloads) and "Go home" buttons.

---

### `ConfirmDialog.tsx`

**Props:** `open`, `onConfirm`, `onCancel`, `title`, `description`, `confirmLabel?`, `confirmVariant?: 'destructive'|'default'`

Uses shadcn/ui `<AlertDialog>`.

---

### `UserAvatar.tsx`

**Props:** `user: User`, `size?: 'sm'|'md'|'lg'`

Shows `avatar_url` if set, else initials in a colored circle (`getInitials(user.full_name)`). Sizes: sm=24px, md=36px, lg=48px.

---

### `ProgressBar.tsx`

**Props:** `value: number` (0–100), `color?: string`, `size?: 'sm'|'md'`

Thin horizontal bar with animated fill transition.

---

### `Pagination.tsx`

**Props:** `page: number`, `totalPages: number`, `onPageChange: (p: number) => void`

Shows: `← Previous`, numbered pages (up to 7 shown, with ellipsis), `Next →`. Updates URL param `?page=`.

---

### `StarRating.tsx`

**Props:** `value: number` (0–5), `interactive?: boolean`, `onChange?: (v: number) => void`

Renders 5 stars. Filled stars = brand-400. Half stars supported. If interactive, hover highlights + click sets value.

---

## 19. TANSTACK QUERY PATTERNS

**Setup in `src/main.tsx`:**
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } }
})
// Wrap <App /> with <QueryClientProvider client={queryClient}>
```

**Pattern for all Supabase reads:**
```ts
// hooks/useCourses.ts
export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      let q = supabase.from('courses').select('*, instructor:profiles(*)', { count: 'exact' }).eq('status', 'published')
      if (filters.category) q = q.eq('category', filters.category)
      if (filters.difficulty) q = q.eq('difficulty', filters.difficulty)
      if (filters.search) q = q.ilike('title', `%${filters.search}%`)
      q = q.range(filters.offset, filters.offset + filters.pageSize - 1)
      const { data, error, count } = await q
      if (error) throw error
      return { data, count }
    },
  })
}
```

**Pattern for all Supabase writes:**
```ts
export function useEnrollCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from('enrollments').insert({ course_id: courseId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      toast.success('Enrolled successfully!')
    },
    onError: (error) => toast.error(error.message),
  })
}
```

**RULE:** Never use `useState` to store server data. Always `useQuery`.

---

## 20. SUPABASE REALTIME PATTERNS

**Pattern: subscribe + always cleanup**
```ts
// hooks/useNotifications.ts
export function useNotificationRealtime() {
  const { addNotification } = useNotificationStore()
  const userId = useAuthStore(s => s.user?.id)

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        addNotification(payload.new as Notification)
      })
      .subscribe()
    
    return () => { supabase.removeChannel(channel) } // MANDATORY CLEANUP
  }, [userId])
}
```

**Realtime channels to create:**
1. `notifications:{userId}` — INSERT on `notifications` table
2. `messages:{userId}` — INSERT on `messages` where sender or receiver = me
3. `progress:{userId}` — UPDATE on `enrollments` for course progress percent

---

## 21. ERROR HANDLING & LOADING STATES

### Every page must have:
1. **Skeleton state** — matches shape of real content. Show while `isLoading` is true.
2. **Error state** — card with error message + retry button when `isError` is true.
3. **Empty state** — when `data.length === 0`.
4. **Success state** — the real content.

### Pattern:
```tsx
const { data, isLoading, isError, error, refetch } = useQuery(...)

if (isLoading) return <SkeletonCard count={8} />
if (isError) return <ErrorCard message={error.message} onRetry={refetch} />
if (!data?.length) return <EmptyState icon={BookOpen} title="No courses yet" description="..." />
return <CourseGrid courses={data} />
```

### Sonner toast usage:
- `toast.success(msg)` — on successful mutations
- `toast.error(msg)` — on API/network errors
- `toast.loading(msg)` — on long operations (file upload, report gen)
- `toast.dismiss()` — when loading complete

### Form validation errors:
- Show inline below each field using React Hook Form's `errors.field.message`
- Red text, `text-danger-500 text-sm mt-1`

---

## 22. PERFORMANCE & ACCESSIBILITY

### Route-level code splitting (mandatory)
Every page is wrapped in `React.lazy()` and `<Suspense fallback={<SkeletonPage />}>`. This is already enforced by the routing in §7.

### Image optimization
- All `<img>` tags must have `width`, `height`, `loading="lazy"`, and `alt` attributes.
- Course thumbnails: display at `max-w-full`, use `object-cover`

### Accessibility (a11y)
- All interactive elements must have visible focus rings (`focus-visible:ring-2 focus-visible:ring-brand-500`)
- All icons have `aria-hidden="true"` since they're decorative
- All buttons that are icon-only must have `aria-label`
- All form inputs must have associated `<label>` via `htmlFor`
- Dialogs/modals must trap focus (shadcn/ui Dialog handles this)
- Color contrast must pass WCAG AA

### Lighthouse targets
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 85+

### SEO
Use `react-helmet-async` for `<title>` and `<meta description>` on all public pages.
```tsx
import { Helmet } from 'react-helmet-async'
<Helmet>
  <title>{course.title} – EduFlow</title>
  <meta name="description" content={course.description.slice(0, 160)} />
</Helmet>
```

### Keyboard navigation
- Tab order logical on all pages
- All dropdowns/modals closeable with Escape
- Tables navigable with arrow keys

---

## 23. ENVIRONMENT VARIABLES

**`.env.local` (never commit this file):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Only two frontend env vars — both must start with `VITE_`.**

**These keys NEVER go in `.env`:**
- `ANTHROPIC_API_KEY` — Edge Function env only
- `RAZORPAY_KEY_SECRET` — Edge Function env only
- `RAZORPAY_WEBHOOK_SECRET` — Edge Function env only
- `RESEND_API_KEY` — Edge Function env only
- Supabase `service_role` key — Edge Function env only

**Vercel deployment:**
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel project environment variables (Settings → Environment Variables)
- Set for Production, Preview, and Development

---

## 24. CRITICAL RULES (NON-NEGOTIABLE)

These rules must never be violated. Any agent building this must follow them exactly.

### R1 — RLS before features
```sql
-- Before building any page, these RLS policies must exist in Supabase:
-- profiles: users can only read/update their own row. Admins can read all.
-- courses: anyone can read published courses. Only owner instructor can update.
-- enrollments: users can only read their own enrollments. Only they can insert their own.
-- progress: users can only read/write their own progress rows.
-- quiz_attempts: users can only access their own attempts.
-- submissions: students see own, instructors see submissions for their courses, admins see all.
-- messages: users see messages where sender_id=me OR receiver_id=me.
-- notifications: users see only their own.
-- admin_settings: admin role only.
-- audit_logs: admin read-only.
```

### R2 — No secret keys in frontend
The only keys in the browser-accessible `.env` are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Any Edge Function call requiring secrets reads them from Supabase Edge Function environment.

### R3 — All 40+ routes registered on Day 1
Before building Phase 2+ pages, all routes in §7 must exist in `App.tsx` as stubs (at minimum `<div>TODO: PageName</div>`). Zero dead links from Day 1.

### R4 — Realtime cleanup
Every `supabase.channel(...).subscribe()` call MUST have a corresponding `supabase.removeChannel(channel)` in the `useEffect` cleanup function. No exceptions.

### R5 — Resumable uploads for video
Any file upload over 50MB must use Supabase Storage's tus (resumable) protocol. Standard `supabase.storage.from().upload()` fails on large videos. Use:
```ts
import * as tus from 'tus-js-client'
// See @supabase/storage-js docs for resumable upload pattern
```

### R6 — Quiz timer is always server-side
Quiz `started_at` is stored in `quiz_attempts` table the moment a quiz starts. On every mount of `QuizPage`, timer is computed from `(time_limit_seconds - (Date.now()/1000 - started_at_epoch))`. Never store remaining time only in React state.

### R7 — TanStack Query is the only server state store
No `useState` holding data fetched from Supabase. Use `useQuery` for reads, `useMutation` for writes, `queryClient.invalidateQueries()` after mutations.

### R8 — Payment verification is server-side only
After Razorpay checkout completes, the frontend NEVER directly enrolls the user. It always sends the payment IDs to the `verify-payment` Edge Function, which re-computes the HMAC-SHA256 signature and only INSERTs enrollment if it matches.

### R9 — Every list/grid has a skeleton loader
Before data loads: show skeleton. Loading spinners may also show for mutations (button loading state). No page ever shows blank white space while loading.

### R10 — Impersonation is reversible
When admin impersonates a user: original admin JWT is stored in `sessionStorage` key `ef-admin-token`. The impersonation banner must always be visible. "Stop impersonating" must restore the admin session from sessionStorage and clear the impersonated JWT.

### R11 — dnd-kit order changes must persist immediately
When an instructor drags a module or lesson to reorder, the new `order_index` must be PATCHed to the database immediately on drop event, not just updated in local React state. This prevents order loss on page refresh.

### R12 — Mobile sidebar uses Sheet
On screens `<md`, the sidebar is hidden. A hamburger icon in the Topbar opens the full sidebar in a shadcn/ui `<Sheet side="left">`. Sheet must be dismissible by clicking the overlay.

### R13 — Audit logs are triggered server-side
Sensitive DB operations (user role change, course delete, bulk import) must be logged to `audit_logs` via a PostgreSQL trigger or Edge Function. The frontend must NOT be responsible for writing audit logs.

---

## PHASE SUMMARY TABLE

| Phase | Duration | Pages Built | Key Milestone |
|---|---|---|---|
| 0 — Foundation | 1–2d | 0 | Supabase live, types defined, RLS active |
| 1 — Auth | 2–3d | 5 | All auth flows work, layouts scaffolded |
| 2 — Public | 2–3d | 3 | Catalog browsable, course detail shown |
| 3 — Student core | 3–4d | 6 | Enroll → watch → quiz → submit |
| 4 — Student ext. | 2–3d | 8 | Grades, certs, badges, chat, leaderboard |
| 5 — Instructor | 3–4d | 4 | Course creation, gradebook working |
| 6 — Admin | 3–4d | 11 | User mgmt, analytics, reports |
| 7 — AI | 2–3d | 3 modals | AI tutor, quiz gen, summarizer |
| 8 — Gamification | 2–3d | — | Certs PDF, badges, points, streaks |
| 9 — Payments | 2–3d | 1 modal | Razorpay → verified enrollment |
| 10 — Mobile | 5–7d | Mobile | React Native + Expo student app |
| 11 — Polish | 2–3d | All | Error bounds, a11y, Lighthouse 90+, deploy |

**Total estimated: ~35–45 working days (solo developer)**

---

*This PRD is the single source of truth. No feature should be built that isn't in this document. No feature in this document should be skipped. Every gap has been intentionally filled.*
