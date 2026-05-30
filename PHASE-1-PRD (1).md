# PHASE 1 PRD — EduFlow LMS
## Foundation Setup + Auth System + All Layouts + All Route Stubs

**Version**: 2.0 (Fully Refined)
**Stack**: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Zustand + TanStack Query
**Goal**: Project scaffolded, every route registered, every layout built, every auth page fully functional, mock data in place. Zero dead ends — every button goes somewhere.

---

## REFINEMENT CHANGELOG (v1.0 → v2.0)

The following bugs, gaps, and inconsistencies were corrected:

| # | Severity | Section | Issue | Fix |
|---|----------|---------|-------|-----|
| 1 | 🔴 CRITICAL | §7.2 | All CSS variable values were RGB tuples — shadcn/ui requires HSL format, causing wrong colors everywhere | All variables rewritten in HSL |
| 2 | 🔴 CRITICAL | §6.3 | Recursive RLS policy on `profiles` table causes infinite loop in PostgreSQL | Replaced with `SECURITY DEFINER` helper function |
| 3 | 🔴 CRITICAL | §11, §12.1 | `storageKey: 'eduflow-auth'` in Supabase client collides with Zustand persist key `name: 'eduflow-auth'` — they overwrite each other in localStorage | Supabase key changed to `'eduflow-supabase-auth'` |
| 4 | 🔴 CRITICAL | §3 | `@radix-ui/react-badge` and `@radix-ui/react-sheet` don't exist on npm | Removed from install command |
| 5 | 🔴 CRITICAL | §11 | `import type { Database } from './database.types'` references a non-existent file — TS compile error | Removed; added comment for optional generation |
| 6 | 🟠 MAJOR | §12.2 | `toggleTheme()` with current theme `'system'` produces `'dark'` unexpectedly | Fixed to properly cycle light → dark → system |
| 7 | 🟠 MAJOR | §14 | `useAuthBootstrap` doesn't handle `TOKEN_REFRESHED` or `PASSWORD_RECOVERY` events | Added both handlers |
| 8 | 🟠 MAJOR | §15 | Shared routes (`/messages`, `/profile`, etc.) wrapped in `StudentLayout` — instructor/admin see student sidebar | Added `RoleAwareLayout` component |
| 9 | 🟠 MAJOR | §17.6 | `LessonLayout` described as bare `<Outlet />` but coursePlayerStore has full state — no layout chrome at all causes jarring UX | Added minimal header with back button and course title |
| 10 | 🟠 MAJOR | §— | `useProfile.ts`, `useDebounce.ts`, `useMediaQuery.ts` hooks listed in structure but never implemented | Full implementations added (§14-ext) |
| 11 | 🟠 MAJOR | §26 | `ErrorState.tsx` listed in deliverables and project structure but never specified | Full spec added (§26.4) |
| 12 | 🟡 MINOR | §23.6 | `exchangeCodeForSession(window.location.search)` may conflict with `detectSessionInUrl: true` | Clarified: disable `detectSessionInUrl` or handle both code and hash |
| 13 | 🟡 MINOR | §29 | Footer copyright year hardcoded as 2024 | Changed to `new Date().getFullYear()` |
| 14 | 🟡 MINOR | §12.1 | `selectRole` type cast `as UserRole | undefined` is redundant since `Profile.role` is already `UserRole` | Removed unnecessary cast |
| 15 | 🟡 MINOR | §4 | `public/logo.svg` listed but never described | SVG content specified in §4-ext |
| 16 | 🟡 MINOR | §21 | `MobileBottomNav` role-awareness not specified in component | Added role prop and auth store usage |
| 17 | 🟡 MINOR | §11 | `getCurrentProfile()` returns `null` silently if profile row missing — no error path | Added error logging and null guard |
| 18 | 🟡 MINOR | §6.4 | No mention of production URL setup in Supabase | Added production notes |
| 19 | 🟡 MINOR | §23.2 | Google OAuth always creates student role — undocumented behavior | Documented clearly |
| 20 | 🟡 MINOR | §32 | Implementation note 12 references `useMediaQuery` without providing it | Hook provided in §14-ext |

---

## 1. OVERVIEW

This phase produces a running application where:
- Every route in the entire app is registered (40+ pages as stubs if not yet built)
- All 6 layouts are complete with working sidebars and topbars
- Auth flows (login, signup, forgot password, reset password, verify email) work end-to-end against real Supabase Auth
- Google OAuth works and redirects correctly
- Role-based routing is enforced
- Dark mode works (system-aware + manual toggle)
- Design system (fonts, colors, spacing) is applied globally
- Mock data is ready for all later phases

**Done when**: You can log in as a student, instructor, or admin and navigate anywhere in the app without hitting a 404 or a dead button.

---

## 2. DELIVERABLES CHECKLIST

- [ ] Vite + React 18 + TypeScript project created
- [ ] All dependencies installed
- [ ] Tailwind CSS + shadcn/ui configured
- [ ] Design system CSS variables defined (HSL format)
- [ ] Google Fonts (Sora, DM Sans) loaded
- [ ] All TypeScript types defined in `src/lib/types.ts`
- [ ] Supabase client configured (correct storage key — no collision)
- [ ] Supabase `profiles` table + RLS (non-recursive) + trigger created
- [ ] All Zustand stores created
- [ ] TanStack Query provider set up
- [ ] `App.tsx` registers every single route
- [ ] `ProtectedRoute` guard working
- [ ] `RoleGuard` guard working
- [ ] `RoleAwareLayout` component created
- [ ] `PublicLayout` complete
- [ ] `AuthLayout` complete
- [ ] `StudentLayout` complete with full sidebar
- [ ] `InstructorLayout` complete with full sidebar
- [ ] `AdminLayout` complete with full sidebar
- [ ] `LessonLayout` complete with minimal top bar
- [ ] `Topbar` component complete (search, theme toggle, notifications, avatar)
- [ ] `Sidebar` component complete (all 3 role variants)
- [ ] `GlobalSearch` component complete
- [ ] `NotificationDropdown` component complete
- [ ] `ProfileDropdown` component complete
- [ ] `ThemeToggle` component complete
- [ ] `/login` page fully functional
- [ ] `/signup` page fully functional
- [ ] `/forgot-password` page fully functional
- [ ] `/reset-password` page fully functional
- [ ] `/verify-email` page fully functional
- [ ] `/auth/callback` OAuth handler complete
- [ ] All stub pages render their layout + placeholder content
- [ ] `src/lib/mockData.ts` complete with realistic data
- [ ] `/403` page complete
- [ ] `/404` page complete
- [ ] Dark mode working (no flash on refresh)
- [ ] `useProfile.ts`, `useDebounce.ts`, `useMediaQuery.ts` hooks implemented
- [ ] `ErrorState.tsx` component implemented

---

## 3. DEPENDENCIES

Run this exact command after `npm create vite@latest eduflow-web -- --template react-ts`:

```bash
npm install \
  @supabase/supabase-js \
  react-router-dom \
  zustand \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  react-hook-form \
  @hookform/resolvers \
  zod \
  sonner \
  lucide-react \
  date-fns \
  clsx \
  tailwind-merge \
  class-variance-authority \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-popover \
  @radix-ui/react-tooltip \
  @radix-ui/react-avatar \
  @radix-ui/react-label \
  @radix-ui/react-separator \
  @radix-ui/react-slot \
  @radix-ui/react-checkbox \
  @radix-ui/react-radio-group \
  @radix-ui/react-select \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-progress \
  @radix-ui/react-accordion \
  @radix-ui/react-scroll-area

npm install -D \
  tailwindcss \
  postcss \
  autoprefixer \
  @types/node \
  tailwindcss-animate
```

> **Removed from v1.0**: `@radix-ui/react-badge` and `@radix-ui/react-sheet` do not exist on npm. shadcn's `badge` component uses only CVA (no Radix primitive). shadcn's `sheet` component uses `@radix-ui/react-dialog` (already in the list above).

Then initialize shadcn/ui:
```bash
npx shadcn@latest init
```
Choose: TypeScript=yes, style=Default, base color=Slate, CSS variables=yes, global CSS=`src/index.css`, tailwind config=`tailwind.config.ts`, import alias=`@/components`, `@/lib/utils`.

Install required shadcn components:
```bash
npx shadcn@latest add button input label card badge avatar dropdown-menu dialog sheet tabs progress accordion separator scroll-area tooltip popover select checkbox radio-group switch skeleton toast
```

---

## 4. PROJECT STRUCTURE

Create exactly this file tree. Every file listed must exist after Phase 1:

```
eduflow-web/
├── public/
│   └── logo.svg                          # EduFlow logo SVG (see §4-ext)
├── index.html                            # Theme init script in <head> (see §30)
├── src/
│   ├── App.tsx                           # ALL routes registered here
│   ├── main.tsx                          # Entry point with all providers
│   ├── index.css                         # Global styles + HSL CSS variables
│   │
│   ├── lib/
│   │   ├── types.ts                      # ALL TypeScript interfaces
│   │   ├── supabase.ts                   # Supabase client
│   │   ├── utils.ts                      # cn() utility + helpers
│   │   ├── mockData.ts                   # ALL mock data
│   │   └── constants.ts                  # Route constants, role names, etc.
│   │
│   ├── store/
│   │   ├── authStore.ts                  # Auth state + actions
│   │   ├── themeStore.ts                 # Dark/light/system mode
│   │   ├── notificationStore.ts          # Notification state
│   │   ├── coursePlayerStore.ts          # Lesson player state
│   │   └── chatStore.ts                  # AI tutor chat state
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                    # Auth bootstrap hook
│   │   ├── useProfile.ts                 # Fetch current user profile via TanStack Query
│   │   ├── useDebounce.ts                # Debounce hook for search inputs
│   │   └── useMediaQuery.ts              # Responsive breakpoint detection
│   │
│   ├── components/
│   │   ├── guards/
│   │   │   ├── ProtectedRoute.tsx        # Requires authentication
│   │   │   └── RoleGuard.tsx             # Requires specific role
│   │   │
│   │   ├── layout/
│   │   │   ├── PublicLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── StudentLayout.tsx
│   │   │   ├── InstructorLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── LessonLayout.tsx
│   │   │   └── RoleAwareLayout.tsx       # Picks correct layout by auth role
│   │   │
│   │   ├── navigation/
│   │   │   ├── Sidebar.tsx               # Role-aware sidebar
│   │   │   ├── Topbar.tsx                # All authenticated topbars
│   │   │   ├── PublicNavbar.tsx          # Public pages navbar
│   │   │   ├── PublicFooter.tsx          # Public pages footer
│   │   │   ├── MobileBottomNav.tsx       # Mobile bottom nav (role-aware)
│   │   │   ├── GlobalSearch.tsx          # Search input + dropdown
│   │   │   ├── NotificationDropdown.tsx  # Notification bell dropdown
│   │   │   └── ProfileDropdown.tsx       # User avatar dropdown
│   │   │
│   │   ├── ui/                           # shadcn/ui components (auto-generated)
│   │   │
│   │   └── common/
│   │       ├── ThemeToggle.tsx
│   │       ├── PageHeader.tsx            # Reusable page title + breadcrumb
│   │       ├── EmptyState.tsx            # Empty state with illustration
│   │       ├── ErrorState.tsx            # Error state with retry button
│   │       └── SkeletonPage.tsx          # Generic page skeleton
│   │
│   └── pages/
│       ├── public/
│       │   ├── LandingPage.tsx           # /
│       │   ├── CatalogPage.tsx           # /catalog
│       │   └── CourseDetailPage.tsx      # /catalog/:courseId
│       │
│       ├── auth/
│       │   ├── LoginPage.tsx             # /login
│       │   ├── SignupPage.tsx            # /signup
│       │   ├── ForgotPasswordPage.tsx    # /forgot-password
│       │   ├── ResetPasswordPage.tsx     # /reset-password
│       │   ├── VerifyEmailPage.tsx       # /verify-email
│       │   └── AuthCallbackPage.tsx      # /auth/callback
│       │
│       ├── student/
│       │   ├── DashboardPage.tsx         # /student/dashboard
│       │   ├── CoursesPage.tsx           # /student/courses
│       │   ├── GradesPage.tsx            # /student/grades
│       │   ├── ProgressPage.tsx          # /student/progress
│       │   ├── CertificatesPage.tsx      # /student/certificates
│       │   ├── BadgesPage.tsx            # /student/badges
│       │   └── AnnouncementsPage.tsx     # /student/announcements
│       │
│       ├── learn/
│       │   ├── CourseOverviewPage.tsx    # /learn/:courseId
│       │   ├── LessonPlayerPage.tsx      # /learn/:courseId/lesson/:lessonId
│       │   ├── QuizPage.tsx              # /learn/:courseId/quiz/:quizId
│       │   └── AssignmentPage.tsx        # /learn/:courseId/assignment/:assignmentId
│       │
│       ├── instructor/
│       │   ├── DashboardPage.tsx         # /instructor/dashboard
│       │   ├── CoursesPage.tsx           # /instructor/courses
│       │   ├── NewCoursePage.tsx         # /instructor/courses/new
│       │   └── CourseHubPage.tsx         # /instructor/courses/:id
│       │
│       ├── admin/
│       │   ├── DashboardPage.tsx         # /admin/dashboard
│       │   ├── UsersPage.tsx             # /admin/users
│       │   ├── NewUserPage.tsx           # /admin/users/new
│       │   ├── UserDetailPage.tsx        # /admin/users/:id
│       │   ├── BulkImportPage.tsx        # /admin/users/bulk-import
│       │   ├── CoursesPage.tsx           # /admin/courses
│       │   ├── AnalyticsPage.tsx         # /admin/analytics
│       │   ├── ReportsPage.tsx           # /admin/reports
│       │   ├── AnnouncementsPage.tsx     # /admin/announcements
│       │   ├── SettingsPage.tsx          # /admin/settings
│       │   └── AuditLogsPage.tsx         # /admin/audit-logs
│       │
│       ├── shared/
│       │   ├── MessagesPage.tsx          # /messages
│       │   ├── NotificationsPage.tsx     # /notifications
│       │   ├── LeaderboardPage.tsx       # /leaderboard
│       │   ├── ProfilePage.tsx           # /profile
│       │   ├── SearchPage.tsx            # /search
│       │   ├── ForumPage.tsx             # /forum/:courseId
│       │   └── ForumThreadPage.tsx       # /forum/:courseId/thread/:threadId
│       │
│       └── errors/
│           ├── NotFoundPage.tsx          # /404 (and catch-all *)
│           └── ForbiddenPage.tsx         # /403
```

---

## 4-ext. LOGO SVG — `public/logo.svg`

```svg
<svg width="140" height="32" viewBox="0 0 140 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Book icon mark -->
  <rect x="0" y="4" width="22" height="24" rx="3" fill="#6366F1"/>
  <rect x="4" y="8" width="14" height="2" rx="1" fill="white" opacity="0.9"/>
  <rect x="4" y="12" width="14" height="2" rx="1" fill="white" opacity="0.7"/>
  <rect x="4" y="16" width="10" height="2" rx="1" fill="white" opacity="0.5"/>
  <rect x="11" y="0" width="2" height="8" rx="1" fill="#4F46E5"/>
  <!-- Wordmark -->
  <text x="30" y="22" font-family="Sora, sans-serif" font-weight="700"
        font-size="18" fill="#0F172A" letter-spacing="-0.3">
    EduFlow
  </text>
</svg>
```

> **Note**: The SVG uses the `Sora` font for the wordmark. In contexts where the font may not be embedded (e.g., img tags), use a fallback PNG or convert text to paths for the production logo. For Phase 1, this SVG is sufficient.

---

## 5. ENVIRONMENT VARIABLES

Create `.env` at project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:5173
```

Create `.env.example` with the same keys but empty values. Add `.env` to `.gitignore`.

> **Production**: When deploying, update `VITE_APP_URL` to your production URL (e.g., `https://eduflow.app`). Add the production callback URL (`https://eduflow.app/auth/callback`) to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.

---

## 6. SUPABASE PROJECT SETUP

### 6.1 Create Supabase project
1. Go to supabase.com → New project
2. Name: `eduflow-lms`
3. Set a strong database password (save it)
4. Region: choose closest to your users
5. Copy Project URL and anon key to `.env`

### 6.2 Enable Google OAuth
1. Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Add `http://localhost:5173/auth/callback` to Redirect URLs
4. Get Client ID + Secret from Google Cloud Console (OAuth 2.0 credentials)
5. Paste into Supabase Google provider settings

> Google OAuth always creates a `student` role (no role field in Google's metadata). Users who want `instructor` role via Google OAuth must update their role via the admin panel or Profile page after signup. This is the intended behavior.

### 6.3 Database schema — run in Supabase SQL Editor

```sql
-- ────────────────────────────────────────────
-- Helper: get role of a user without RLS recursion
-- ────────────────────────────────────────────
-- MUST be created BEFORE the RLS policies that reference it.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id
$$;

-- ────────────────────────────────────────────
-- profiles table (extends auth.users)
-- ────────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT        NOT NULL,
  full_name   TEXT        NOT NULL DEFAULT '',
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'student'
                          CHECK (role IN ('student', 'instructor', 'admin')),
  bio         TEXT,
  department  TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ────────────────────────────
-- Users: view/update own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins: view/update any profile
-- Uses get_user_role() to avoid recursive self-join on profiles table.
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Instructors: read student profiles (needed for course management in later phases)
CREATE POLICY "Instructors can view student profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'instructor');

-- ── Triggers ────────────────────────────────
-- Auto-create profile row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

> **Why `get_user_role` is necessary**: Directly querying `public.profiles` inside an RLS policy on `public.profiles` causes PostgreSQL to infinitely recurse. The `SECURITY DEFINER` function bypasses RLS when called, breaking the recursion.

### 6.4 Authentication settings (Supabase Dashboard → Auth → Settings)
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/auth/callback`
- Email confirmations: ENABLED
- Minimum password length: 8
- Auth flow: **PKCE** (default for new projects — do not change to implicit)

---

## 7. DESIGN SYSTEM

### 7.1 `tailwind.config.ts` — exact content

```typescript
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border:  'hsl(var(--border))',
        input:   'hsl(var(--input))',
        ring:    'hsl(var(--ring))',
        // Semantic aliases
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
      },
      fontFamily: {
        sans:    ['DM Sans', ...fontFamily.sans],
        heading: ['Sora', ...fontFamily.sans],
        mono:    ['JetBrains Mono', ...fontFamily.mono],
      },
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        xl:  '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        modal: '0 20px 60px -10px rgb(0 0 0 / 0.2)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        shimmer:          'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

> **Important**: Tailwind colors are defined as `hsl(var(--variable))` wrappers, not hardcoded hex values. This ensures every Tailwind utility (e.g., `bg-primary`, `text-foreground`, `border-border`) automatically responds to dark mode CSS variable overrides. Never use hardcoded hex colors in Tailwind class definitions.

### 7.2 `src/index.css` — exact content

> **Critical**: All CSS variable values use **HSL space-separated** format (H S% L%). This is what shadcn/ui and the `hsl(var(--x))` wrappers in Tailwind config expect. The values are used like: `background: hsl(var(--background))`.

```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ── Primary (Indigo #6366F1) ─────────────── */
    --primary:             239 84% 67%;
    --primary-foreground:  0 0% 100%;

    /* ── Accent (Amber #F59E0B) ───────────────── */
    --accent:              38 92% 50%;
    --accent-foreground:   0 0% 100%;

    /* ── Backgrounds ──────────────────────────── */
    --background:          210 40% 98%;   /* #F8FAFC */
    --foreground:          222 47% 11%;   /* #0F172A */

    /* ── Card / Popover (white in light) ─────── */
    --card:                0 0% 100%;
    --card-foreground:     222 47% 11%;
    --popover:             0 0% 100%;
    --popover-foreground:  222 47% 11%;

    /* ── Secondary (slate-100) ───────────────── */
    --secondary:           210 40% 96%;   /* #F1F5F9 */
    --secondary-foreground: 222 47% 11%;

    /* ── Muted (slate-100/text-slate-500) ────── */
    --muted:               210 40% 96%;
    --muted-foreground:    215 16% 47%;   /* #64748B */

    /* ── Destructive (red-500) ───────────────── */
    --destructive:         0 84% 60%;     /* #EF4444 */
    --destructive-foreground: 0 0% 100%;

    /* ── Border / Input / Ring ───────────────── */
    --border:              214 32% 91%;   /* #E2E8F0 */
    --input:               214 32% 91%;
    --ring:                239 84% 67%;   /* matches --primary */

    /* ── Border radius ───────────────────────── */
    --radius:              0.75rem;
  }

  .dark {
    /* ── Backgrounds ──────────────────────────── */
    --background:          222 47% 11%;   /* #0F172A */
    --foreground:          210 40% 96%;   /* #F1F5F9 */

    /* ── Card / Popover (slate-800 in dark) ─── */
    --card:                217 33% 17%;   /* #1E293B */
    --card-foreground:     210 40% 96%;
    --popover:             217 33% 17%;
    --popover-foreground:  210 40% 96%;

    /* ── Secondary ───────────────────────────── */
    --secondary:           217 33% 17%;
    --secondary-foreground: 210 40% 96%;

    /* ── Muted ───────────────────────────────── */
    --muted:               217 33% 17%;
    --muted-foreground:    215 20% 65%;   /* #94A3B8 */

    /* ── Primary/Accent unchanged in dark ────── */
    --primary:             239 84% 67%;
    --primary-foreground:  0 0% 100%;
    --accent:              38 92% 50%;
    --accent-foreground:   0 0% 100%;

    /* ── Destructive unchanged ───────────────── */
    --destructive:         0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* ── Border / Input / Ring ───────────────── */
    --border:              215 25% 27%;   /* #334155 */
    --input:               215 25% 27%;
    --ring:                239 84% 67%;
  }

  * {
    @apply border-border;
    box-sizing: border-box;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}

@layer components {
  /* Sidebar nav item transitions */
  .sidebar-transition {
    @apply transition-all duration-200 ease-in-out;
  }

  /* Shimmer skeleton */
  .skeleton {
    @apply bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%];
    animation: shimmer 1.5s infinite;
  }

  /* Active sidebar nav item */
  .nav-item-active {
    @apply bg-primary/10 text-primary font-medium border-l-2 border-primary;
  }

  /* Card with hover lift */
  .card-hover {
    @apply transition-shadow duration-200 hover:shadow-md cursor-pointer;
  }
}
```

---

## 8. TYPESCRIPT TYPES — `src/lib/types.ts`

Define ALL interfaces. Every page in later phases will import from here. Do not split this file.

```typescript
// ─── USER & AUTH ─────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'instructor' | 'admin'

export interface Profile {
  id:         string
  email:      string
  full_name:  string
  avatar_url: string | null
  role:       UserRole
  bio:        string | null
  department: string | null
  is_active:  boolean
  created_at: string
  updated_at: string
}

// AuthUser is the same shape as Profile — kept separate for semantic clarity
export type AuthUser = Profile

// ─── COURSE ──────────────────────────────────────────────────────────────────

export type CourseStatus   = 'draft' | 'published' | 'archived'
export type CourseLevel    = 'beginner' | 'intermediate' | 'advanced'
export type CourseCategory = 'programming' | 'design' | 'business' | 'marketing' | 'data-science' | 'other'
export type PricingType    = 'free' | 'paid' | 'subscription'

export interface Course {
  id:               string
  title:            string
  description:      string
  thumbnail_url:    string | null
  instructor_id:    string
  instructor:       Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  category:         CourseCategory
  level:            CourseLevel
  pricing_type:     PricingType
  price:            number         // 0 for free courses
  status:           CourseStatus
  tags:             string[]
  duration_minutes: number
  lesson_count:     number
  enrollment_count: number
  rating:           number         // 0.0–5.0
  rating_count:     number
  what_you_learn:   string[]
  requirements:     string[]
  created_at:       string
  updated_at:       string
}

// ─── MODULE & LESSON ─────────────────────────────────────────────────────────

export type LessonType = 'video' | 'pdf' | 'text' | 'quiz' | 'assignment'

export interface Module {
  id:          string
  course_id:   string
  title:       string
  order_index: number
  lessons:     Lesson[]
}

export interface Lesson {
  id:               string
  module_id:        string
  course_id:        string
  title:            string
  type:             LessonType
  content_url:      string | null
  content_text:     string | null
  duration_minutes: number
  order_index:      number
  is_free_preview:  boolean
  created_at:       string
}

// ─── ENROLLMENT & PROGRESS ───────────────────────────────────────────────────

export type EnrollmentStatus = 'active' | 'completed' | 'dropped'

export interface Enrollment {
  id:           string
  user_id:      string
  course_id:    string
  course:       Course
  status:       EnrollmentStatus
  progress:     number         // 0–100
  enrolled_at:  string
  completed_at: string | null
}

export interface LessonProgress {
  id:           string
  user_id:      string
  lesson_id:    string
  course_id:    string
  completed:    boolean
  completed_at: string | null
  time_spent:   number         // seconds
}

// ─── QUIZ ────────────────────────────────────────────────────────────────────

export type QuestionType = 'mcq' | 'true_false' | 'short_answer'

export interface Quiz {
  id:           string
  lesson_id:    string
  course_id:    string
  title:        string
  time_limit:   number | null  // minutes, null = no limit
  max_attempts: number
  pass_score:   number         // percentage required to pass
  questions:    Question[]
  created_at:   string
}

export interface Question {
  id:          string
  quiz_id:     string
  type:        QuestionType
  text:        string
  options:     string[]               // for MCQ; empty for short_answer
  correct:     string | string[]      // correct option(s) or answer text
  explanation: string | null
  order_index: number
  points:      number
}

export interface QuizAttempt {
  id:           string
  quiz_id:      string
  user_id:      string
  answers:      Record<string, string> // question_id → selected answer
  score:        number
  passed:       boolean
  started_at:   string
  submitted_at: string | null
}

// ─── ASSIGNMENT ──────────────────────────────────────────────────────────────

export interface Assignment {
  id:          string
  lesson_id:   string
  course_id:   string
  title:       string
  description: string
  due_date:    string | null
  max_score:   number
  rubric:      RubricCriteria[]
  created_at:  string
}

export interface RubricCriteria {
  id:          string
  title:       string
  description: string
  max_points:  number
}

export interface Submission {
  id:            string
  assignment_id: string
  user_id:       string
  content:       string                // HTML from TipTap editor (Phase 5)
  file_urls:     string[]
  status:        'submitted' | 'graded' | 'returned'
  grade:         number | null
  feedback:      string | null
  submitted_at:  string
  graded_at:     string | null
}

// ─── GRADES ──────────────────────────────────────────────────────────────────

export interface Grade {
  id:         string
  user_id:    string
  course_id:  string
  item_id:    string               // quiz_attempt_id or submission_id
  item_type:  'quiz' | 'assignment'
  item_title: string
  score:      number
  max_score:  number
  percentage: number               // computed: (score / max_score) * 100
  graded_at:  string
}

// ─── CERTIFICATE & BADGE ─────────────────────────────────────────────────────

export interface Certificate {
  id:            string
  user_id:       string
  course_id:     string
  course:        Pick<Course, 'id' | 'title' | 'instructor'>
  issued_at:     string
  pdf_url:       string
  credential_id: string            // unique verifiable ID
}

export interface Badge {
  id:          string
  name:        string
  description: string
  icon_url:    string              // URL or emoji string for Phase 1 mocks
  color:       string              // CSS color or hex
  condition:   string              // human-readable, e.g. "Complete 5 courses"
}

export interface UserBadge {
  id:        string
  user_id:   string
  badge:     Badge
  earned_at: string
}

// ─── ANNOUNCEMENT ────────────────────────────────────────────────────────────

export type AnnouncementAudience = 'all' | 'students' | 'instructors' | 'course'

export interface Announcement {
  id:         string
  author_id:  string
  author:     Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  title:      string
  content:    string               // HTML content
  audience:   AnnouncementAudience
  course_id:  string | null
  is_pinned:  boolean
  created_at: string
}

// ─── MESSAGING ───────────────────────────────────────────────────────────────

export interface Conversation {
  id:           string
  participants: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>[]
  last_message: Message | null
  unread_count: number
  updated_at:   string
}

export interface Message {
  id:              string
  conversation_id: string
  sender_id:       string
  sender:          Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  content:         string
  file_url:        string | null
  created_at:      string
  read_at:         string | null
}

// ─── NOTIFICATION ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'assignment_graded'
  | 'quiz_result'
  | 'new_announcement'
  | 'new_message'
  | 'enrollment_confirmed'
  | 'course_completed'
  | 'badge_earned'

export interface Notification {
  id:         string
  user_id:    string
  type:       NotificationType
  title:      string
  body:       string
  link:       string | null         // internal route to navigate to on click
  is_read:    boolean
  created_at: string
}

// ─── FORUM ───────────────────────────────────────────────────────────────────

export type ForumTag = 'question' | 'discussion' | 'resource'

export interface ForumThread {
  id:          string
  course_id:   string
  author:      Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  title:       string
  content:     string
  tag:         ForumTag
  upvotes:     number
  reply_count: number
  is_pinned:   boolean
  is_answered: boolean
  created_at:  string
}

export interface ForumReply {
  id:         string
  thread_id:  string
  author:     Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  content:    string
  upvotes:    number
  is_answer:  boolean              // marked as the accepted answer
  parent_id:  string | null        // for nested replies
  created_at: string
}

// ─── ANALYTICS (ADMIN) ───────────────────────────────────────────────────────

export interface AdminKPIs {
  total_users:        number
  new_users_7d:       number
  active_users:       number
  total_courses:      number
  total_enrollments:  number
  completion_rate:    number        // percentage
  avg_score:          number        // average quiz score percentage
  total_revenue:      number        // in INR paise or rupees (define in mockData)
  mrr:                number        // monthly recurring revenue
  certificates_issued: number
}

// ─── PAYMENT ─────────────────────────────────────────────────────────────────

export interface Payment {
  id:         string
  user_id:    string
  course_id:  string
  course:     Pick<Course, 'id' | 'title'>
  amount:     number               // in INR
  currency:   string               // 'INR'
  status:     'pending' | 'paid' | 'failed' | 'refunded'
  order_id:   string               // Razorpay order ID (Phase 6)
  payment_id: string | null        // Razorpay payment ID after success
  created_at: string
}

// ─── GAMIFICATION ────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank:    number
  user:    Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  points:  number
  badges:  number
  courses: number
}

export interface Streak {
  user_id:        string
  current_streak: number
  longest_streak: number
  last_active:    string
  calendar:       StreakDay[]
}

export interface StreakDay {
  date:   string     // ISO date string
  active: boolean
}

// ─── AUDIT LOG (ADMIN) ───────────────────────────────────────────────────────

export interface AuditLog {
  id:          string
  user_id:     string
  user:        Pick<Profile, 'id' | 'full_name' | 'role'>
  action:      string              // e.g., 'user.created', 'course.published'
  resource:    string              // e.g., 'user', 'course'
  resource_id: string | null
  ip_address:  string
  payload:     Record<string, unknown> | null
  created_at:  string
}
```

---

## 9. UTILITY FUNCTIONS — `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind classes safely (handles conflicts). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format INR currency. */
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Format date as "12 Jan 2024". */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  }).format(new Date(dateStr))
}

/** Format relative time: "just now", "5m ago", "2h ago", "3d ago". */
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs  = Math.floor(diff / 1000)
  if (secs < 60)    return 'just now'
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

/** Truncate string to length with ellipsis. */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}

/** Extract initials from full name (max 2 chars). */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Format duration in minutes to "1h 30m", "45m", "2h". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Compute password strength: 'weak' | 'medium' | 'strong'. */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  const hasMinLength  = password.length >= 8
  const hasNumber     = /[0-9]/.test(password)
  const hasUppercase  = /[A-Z]/.test(password)
  const hasSpecial    = /[^A-Za-z0-9]/.test(password)
  const score = [hasMinLength, hasNumber, hasUppercase, hasSpecial].filter(Boolean).length
  if (score <= 1) return 'weak'
  if (score === 2 || score === 3) return 'medium'
  return 'strong'
}
```

---

## 10. CONSTANTS — `src/lib/constants.ts`

```typescript
export const ROUTES = {
  HOME:              '/',
  CATALOG:           '/catalog',
  CATALOG_DETAIL:    '/catalog/:courseId',
  LOGIN:             '/login',
  SIGNUP:            '/signup',
  FORGOT_PASSWORD:   '/forgot-password',
  RESET_PASSWORD:    '/reset-password',
  VERIFY_EMAIL:      '/verify-email',
  AUTH_CALLBACK:     '/auth/callback',

  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_COURSES:   '/student/courses',
  STUDENT_GRADES:    '/student/grades',
  STUDENT_PROGRESS:  '/student/progress',
  STUDENT_CERTS:     '/student/certificates',
  STUDENT_BADGES:    '/student/badges',
  STUDENT_ANNOUNCE:  '/student/announcements',

  LEARN_OVERVIEW:    '/learn/:courseId',
  LEARN_LESSON:      '/learn/:courseId/lesson/:lessonId',
  LEARN_QUIZ:        '/learn/:courseId/quiz/:quizId',
  LEARN_ASSIGNMENT:  '/learn/:courseId/assignment/:assignmentId',

  INSTRUCTOR_DASH:   '/instructor/dashboard',
  INSTRUCTOR_COURSES:'/instructor/courses',
  INSTRUCTOR_NEW:    '/instructor/courses/new',
  INSTRUCTOR_HUB:    '/instructor/courses/:id',

  ADMIN_DASH:        '/admin/dashboard',
  ADMIN_USERS:       '/admin/users',
  ADMIN_USER_NEW:    '/admin/users/new',
  ADMIN_USER_DETAIL: '/admin/users/:id',
  ADMIN_BULK_IMPORT: '/admin/users/bulk-import',
  ADMIN_COURSES:     '/admin/courses',
  ADMIN_ANALYTICS:   '/admin/analytics',
  ADMIN_REPORTS:     '/admin/reports',
  ADMIN_ANNOUNCE:    '/admin/announcements',
  ADMIN_SETTINGS:    '/admin/settings',
  ADMIN_AUDIT:       '/admin/audit-logs',

  MESSAGES:          '/messages',
  NOTIFICATIONS:     '/notifications',
  LEADERBOARD:       '/leaderboard',
  PROFILE:           '/profile',
  SEARCH:            '/search',
  FORUM:             '/forum/:courseId',
  FORUM_THREAD:      '/forum/:courseId/thread/:threadId',

  NOT_FOUND:         '/404',
  FORBIDDEN:         '/403',
} as const

export const ROLE_DASHBOARDS = {
  student:    '/student/dashboard',
  instructor: '/instructor/dashboard',
  admin:      '/admin/dashboard',
} as const

export const NAV_LABELS: Record<string, string> = {
  student:    'Student',
  instructor: 'Instructor',
  admin:      'Admin',
  dashboard:  'Dashboard',
  courses:    'Courses',
  grades:     'Grades',
  progress:   'Progress',
  certificates: 'Certificates',
  badges:     'Badges',
  announcements: 'Announcements',
  messages:   'Messages',
  notifications: 'Notifications',
  leaderboard: 'Leaderboard',
  profile:    'Profile',
  search:     'Search',
  users:      'Users',
  analytics:  'Analytics',
  reports:    'Reports',
  settings:   'Settings',
  'audit-logs': 'Audit Logs',
}
```

---

## 11. SUPABASE CLIENT — `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Profile } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,
    // detectSessionInUrl handles the PKCE code exchange on /auth/callback.
    // Set to true and let AuthCallbackPage call exchangeCodeForSession manually.
    detectSessionInUrl: false,
    // ⚠️ IMPORTANT: use a different key from the Zustand authStore persist key
    // ('eduflow-auth') to avoid localStorage collision.
    storageKey:         'eduflow-supabase-auth',
  },
})

/** Returns the active session, or null. */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Fetches the full Profile row for the currently authenticated user.
 * Returns null if no session or if the profile row is missing (logs a warning).
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const session = await getSession()
  if (!session) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    // This can happen if the trigger hasn't run yet or the profile was deleted.
    console.warn('[supabase] Profile fetch failed:', error.message)
    return null
  }

  return data as Profile
}
```

> **Why `detectSessionInUrl: false`**: The PKCE code exchange (for OAuth and email magic links) is handled explicitly in `AuthCallbackPage` via `supabase.auth.exchangeCodeForSession(window.location.search)`. If `detectSessionInUrl: true` were also set, Supabase would attempt to process the URL automatically on client initialization, potentially racing with the manual call. Disabling it gives full control to `AuthCallbackPage`.

---

## 12. ZUSTAND STORES

### 12.1 `src/store/authStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, UserRole } from '@/lib/types'

interface AuthState {
  user:            Profile | null
  isAuthenticated: boolean
  isLoading:       boolean

  setUser:    (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  logout:     () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,
      isLoading:       true,   // starts true; set to false after bootstrap

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      logout: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      // ⚠️ This key MUST differ from supabase.ts storageKey ('eduflow-supabase-auth')
      name: 'eduflow-auth',
      // Only persist user identity — never persist isLoading
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selector helpers — use these to avoid inline arrow functions in components
export const selectUser        = (s: AuthState) => s.user
export const selectRole        = (s: AuthState): UserRole | undefined => s.user?.role
export const selectIsAuth      = (s: AuthState) => s.isAuthenticated
export const selectIsLoading   = (s: AuthState) => s.isLoading
```

### 12.2 `src/store/themeStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme:       Theme
  setTheme:    (t: Theme) => void
  toggleTheme: () => void
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      toggleTheme: () => {
        // Cycle: light → dark → system → light → ...
        const order: Theme[] = ['light', 'dark', 'system']
        const current = get().theme
        const next = order[(order.indexOf(current) + 1) % order.length]
        applyTheme(next)
        set({ theme: next })
      },
    }),
    { name: 'eduflow-theme' }
  )
)
```

### 12.3 `src/store/notificationStore.ts`

```typescript
import { create } from 'zustand'
import type { Notification } from '@/lib/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount:   number

  setNotifications: (n: Notification[]) => void
  addNotification:  (n: Notification) => void
  markRead:         (id: string) => void
  markAllRead:      () => void
  deleteOne:        (id: string) => void
  deleteAll:        () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount:   0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.is_read).length,
    }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount:   s.unreadCount + (n.is_read ? 0 : 1),
    })),

  markRead: (id) =>
    set((s) => {
      const wasUnread = s.notifications.find(n => n.id === id && !n.is_read)
      return {
        notifications: s.notifications.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      }
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount:   0,
    })),

  deleteOne: (id) =>
    set((s) => {
      const target = s.notifications.find(n => n.id === id)
      return {
        notifications: s.notifications.filter(n => n.id !== id),
        unreadCount:   target && !target.is_read
          ? Math.max(0, s.unreadCount - 1)
          : s.unreadCount,
      }
    }),

  deleteAll: () =>
    set({ notifications: [], unreadCount: 0 }),
}))
```

### 12.4 `src/store/coursePlayerStore.ts`

```typescript
import { create } from 'zustand'

type RightPanelTab = 'notes' | 'ai' | 'resources'

interface CoursePlayerState {
  currentCourseId:  string | null
  currentLessonId:  string | null
  isOutlineOpen:    boolean
  isRightPanelOpen: boolean
  rightPanelTab:    RightPanelTab

  setCurrentLesson:  (courseId: string, lessonId: string) => void
  toggleOutline:     () => void
  toggleRightPanel:  () => void
  setRightPanelTab:  (tab: RightPanelTab) => void
  reset:             () => void
}

const initialState = {
  currentCourseId:  null,
  currentLessonId:  null,
  isOutlineOpen:    true,
  isRightPanelOpen: true,
  rightPanelTab:    'notes' as RightPanelTab,
}

export const useCoursePlayerStore = create<CoursePlayerState>((set) => ({
  ...initialState,

  setCurrentLesson: (courseId, lessonId) =>
    set({ currentCourseId: courseId, currentLessonId: lessonId }),

  toggleOutline:    () => set((s) => ({ isOutlineOpen:    !s.isOutlineOpen })),
  toggleRightPanel: () => set((s) => ({ isRightPanelOpen: !s.isRightPanelOpen })),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  reset:            () => set(initialState),
}))
```

### 12.5 `src/store/chatStore.ts`

```typescript
import { create } from 'zustand'

export interface ChatMessage {
  id:        string
  role:      'user' | 'assistant'
  content:   string
  timestamp: string
}

interface ChatState {
  messages:      ChatMessage[]
  isStreaming:   boolean
  courseContext: string | null     // course title or ID for AI context

  addMessage:       (msg: ChatMessage) => void
  updateLastMessage:(content: string) => void   // for streaming token appends
  setStreaming:     (v: boolean) => void
  setCourseContext: (ctx: string | null) => void
  clearChat:        () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages:      [],
  isStreaming:   false,
  courseContext: null,

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages]
      if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
      return { messages: msgs }
    }),

  setStreaming:     (v) =>   set({ isStreaming: v }),
  setCourseContext: (ctx) => set({ courseContext: ctx }),
  clearChat:        () =>   set({ messages: [] }),
}))
```

---

## 13. MAIN ENTRY — `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 5,  // 5 minutes
      retry:                2,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* Toaster placed once here — NOT inside any layout component */}
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

---

## 14. AUTH BOOTSTRAP — `src/hooks/useAuth.ts`

This hook initializes auth state on app mount by listening to Supabase auth events.

```typescript
import { useEffect } from 'react'
import { supabase, getCurrentProfile } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

export function useAuthBootstrap() {
  const { setUser, setLoading, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    // Apply stored theme on mount (handles page refresh)
    setTheme(theme)

    // Initial session check — resolves the isLoading flag immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const profile = await getCurrentProfile()
        setUser(profile)  // setUser handles null: logs out cleanly
      } else {
        setLoading(false)
      }
    })

    // Listen for all auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const profile = await getCurrentProfile()
          setUser(profile)
        } else if (event === 'SIGNED_OUT') {
          logout()
        } else if (event === 'USER_UPDATED' && session) {
          const profile = await getCurrentProfile()
          setUser(profile)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token was silently refreshed — no UI action needed,
          // but ensure user state is fresh if it somehow got stale.
          if (!useAuthStore.getState().user) {
            const profile = await getCurrentProfile()
            setUser(profile)
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          // User clicked the reset password link. Do NOT setUser here —
          // ResetPasswordPage handles this event via its own listener.
          // Just ensure isLoading is false so the page renders.
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])
}
```

---

## 14-ext. ADDITIONAL HOOKS

### `src/hooks/useProfile.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/lib/types'

/**
 * Fetches the current user's profile from Supabase via TanStack Query.
 * Useful in components that need fresh profile data beyond the Zustand store.
 */
export function useProfile() {
  const userId = useAuthStore(s => s.user?.id)

  return useQuery<Profile | null>({
    queryKey:  ['profile', userId],
    queryFn:   async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled:   !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
```

### `src/hooks/useDebounce.ts`

```typescript
import { useState, useEffect } from 'react'

/**
 * Returns a debounced copy of `value` that only updates
 * after `delay` milliseconds of no changes.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

### `src/hooks/useMediaQuery.ts`

```typescript
import { useState, useEffect } from 'react'

/**
 * Returns true while the media query matches.
 * @example const isMobile = useMediaQuery('(max-width: 767px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    () => window.matchMedia(query).matches
  )

  useEffect(() => {
    const mql     = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Convenience hooks for common breakpoints
export const useMobile  = () => useMediaQuery('(max-width: 767px)')
export const useTablet  = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
export const useDesktop = () => useMediaQuery('(min-width: 1024px)')
```

---

## 15. APP.TSX — ALL ROUTES

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthBootstrap } from '@/hooks/useAuth'
import { useAuthStore, selectIsLoading } from '@/store/authStore'

// Guards
import ProtectedRoute from '@/components/guards/ProtectedRoute'
import RoleGuard      from '@/components/guards/RoleGuard'

// Layouts
import PublicLayout     from '@/components/layout/PublicLayout'
import AuthLayout       from '@/components/layout/AuthLayout'
import StudentLayout    from '@/components/layout/StudentLayout'
import InstructorLayout from '@/components/layout/InstructorLayout'
import AdminLayout      from '@/components/layout/AdminLayout'
import LessonLayout     from '@/components/layout/LessonLayout'
import RoleAwareLayout  from '@/components/layout/RoleAwareLayout'

// Auth pages (FULLY BUILT in Phase 1)
import LoginPage          from '@/pages/auth/LoginPage'
import SignupPage         from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from '@/pages/auth/ResetPasswordPage'
import VerifyEmailPage    from '@/pages/auth/VerifyEmailPage'
import AuthCallbackPage   from '@/pages/auth/AuthCallbackPage'

// Public pages (stubs in Phase 1, fully built in Phase 2)
import LandingPage      from '@/pages/public/LandingPage'
import CatalogPage      from '@/pages/public/CatalogPage'
import CourseDetailPage from '@/pages/public/CourseDetailPage'

// Student pages
import StudentDashboard     from '@/pages/student/DashboardPage'
import StudentCourses       from '@/pages/student/CoursesPage'
import StudentGrades        from '@/pages/student/GradesPage'
import StudentProgress      from '@/pages/student/ProgressPage'
import StudentCertificates  from '@/pages/student/CertificatesPage'
import StudentBadges        from '@/pages/student/BadgesPage'
import StudentAnnouncements from '@/pages/student/AnnouncementsPage'

// Learn pages
import CourseOverviewPage from '@/pages/learn/CourseOverviewPage'
import LessonPlayerPage   from '@/pages/learn/LessonPlayerPage'
import QuizPage           from '@/pages/learn/QuizPage'
import AssignmentPage     from '@/pages/learn/AssignmentPage'

// Instructor pages
import InstructorDashboard from '@/pages/instructor/DashboardPage'
import InstructorCourses   from '@/pages/instructor/CoursesPage'
import NewCoursePage       from '@/pages/instructor/NewCoursePage'
import CourseHubPage       from '@/pages/instructor/CourseHubPage'

// Admin pages
import AdminDashboard     from '@/pages/admin/DashboardPage'
import AdminUsers         from '@/pages/admin/UsersPage'
import AdminNewUser       from '@/pages/admin/NewUserPage'
import AdminUserDetail    from '@/pages/admin/UserDetailPage'
import AdminBulkImport    from '@/pages/admin/BulkImportPage'
import AdminCourses       from '@/pages/admin/CoursesPage'
import AdminAnalytics     from '@/pages/admin/AnalyticsPage'
import AdminReports       from '@/pages/admin/ReportsPage'
import AdminAnnouncements from '@/pages/admin/AnnouncementsPage'
import AdminSettings      from '@/pages/admin/SettingsPage'
import AdminAuditLogs     from '@/pages/admin/AuditLogsPage'

// Shared pages (any authenticated role)
import MessagesPage      from '@/pages/shared/MessagesPage'
import NotificationsPage from '@/pages/shared/NotificationsPage'
import LeaderboardPage   from '@/pages/shared/LeaderboardPage'
import ProfilePage       from '@/pages/shared/ProfilePage'
import SearchPage        from '@/pages/shared/SearchPage'
import ForumPage         from '@/pages/shared/ForumPage'
import ForumThreadPage   from '@/pages/shared/ForumThreadPage'

// Error pages
import NotFoundPage  from '@/pages/errors/NotFoundPage'
import ForbiddenPage from '@/pages/errors/ForbiddenPage'

export default function App() {
  useAuthBootstrap()
  const isLoading = useAuthStore(selectIsLoading)

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading EduFlow…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* ── PUBLIC ─────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/"                   element={<LandingPage />} />
        <Route path="/catalog"            element={<CatalogPage />} />
        <Route path="/catalog/:courseId"  element={<CourseDetailPage />} />
      </Route>

      {/* ── AUTH ───────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/verify-email"    element={<VerifyEmailPage />} />
      </Route>

      {/* OAuth + email confirmation callback — no layout wrapper */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* ── STUDENT ────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard roles={['student']} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard"     element={<StudentDashboard />} />
            <Route path="/student/courses"       element={<StudentCourses />} />
            <Route path="/student/grades"        element={<StudentGrades />} />
            <Route path="/student/progress"      element={<StudentProgress />} />
            <Route path="/student/certificates"  element={<StudentCertificates />} />
            <Route path="/student/badges"        element={<StudentBadges />} />
            <Route path="/student/announcements" element={<StudentAnnouncements />} />
          </Route>
        </Route>
      </Route>

      {/* ── LEARN (student + instructor preview) ───── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<LessonLayout />}>
          <Route path="/learn/:courseId"                          element={<CourseOverviewPage />} />
          <Route path="/learn/:courseId/lesson/:lessonId"         element={<LessonPlayerPage />} />
          <Route path="/learn/:courseId/quiz/:quizId"             element={<QuizPage />} />
          <Route path="/learn/:courseId/assignment/:assignmentId" element={<AssignmentPage />} />
        </Route>
      </Route>

      {/* ── INSTRUCTOR ─────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard roles={['instructor', 'admin']} />}>
          <Route element={<InstructorLayout />}>
            <Route path="/instructor/dashboard"   element={<InstructorDashboard />} />
            <Route path="/instructor/courses"     element={<InstructorCourses />} />
            <Route path="/instructor/courses/new" element={<NewCoursePage />} />
            <Route path="/instructor/courses/:id" element={<CourseHubPage />} />
          </Route>
        </Route>
      </Route>

      {/* ── ADMIN ──────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard"         element={<AdminDashboard />} />
            <Route path="/admin/users"             element={<AdminUsers />} />
            <Route path="/admin/users/new"         element={<AdminNewUser />} />
            <Route path="/admin/users/bulk-import" element={<AdminBulkImport />} />
            <Route path="/admin/users/:id"         element={<AdminUserDetail />} />
            <Route path="/admin/courses"           element={<AdminCourses />} />
            <Route path="/admin/analytics"         element={<AdminAnalytics />} />
            <Route path="/admin/reports"           element={<AdminReports />} />
            <Route path="/admin/announcements"     element={<AdminAnnouncements />} />
            <Route path="/admin/settings"          element={<AdminSettings />} />
            <Route path="/admin/audit-logs"        element={<AdminAuditLogs />} />
          </Route>
        </Route>
      </Route>

      {/* ── SHARED (any authenticated role) ────────── */}
      {/*
        RoleAwareLayout renders StudentLayout, InstructorLayout, or AdminLayout
        based on the authenticated user's role. This fixes the Phase 1 issue of
        all shared routes defaulting to StudentLayout.
      */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleAwareLayout />}>
          <Route path="/messages"                              element={<MessagesPage />} />
          <Route path="/notifications"                         element={<NotificationsPage />} />
          <Route path="/leaderboard"                           element={<LeaderboardPage />} />
          <Route path="/profile"                               element={<ProfilePage />} />
          <Route path="/search"                                element={<SearchPage />} />
          <Route path="/forum/:courseId"                       element={<ForumPage />} />
          <Route path="/forum/:courseId/thread/:threadId"      element={<ForumThreadPage />} />
        </Route>
      </Route>

      {/* ── ERRORS ─────────────────────────────────── */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
```

> **Route ordering note**: React Router v6 uses path specificity, so `/admin/users/new` and `/admin/users/bulk-import` correctly take precedence over `/admin/users/:id` even when listed after. No manual ordering workaround is needed.

---

## 16. ROUTE GUARDS

### 16.1 `src/components/guards/ProtectedRoute.tsx`

```typescript
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // App.tsx handles the global loading screen — return null here is safe
  if (isLoading) return null

  if (!isAuthenticated) {
    // Preserve intended destination for post-login redirect
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return <Outlet />
}
```

### 16.2 `src/components/guards/RoleGuard.tsx`

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/lib/types'

interface RoleGuardProps {
  roles: UserRole[]
}

export default function RoleGuard({ roles }: RoleGuardProps) {
  const user = useAuthStore(s => s.user)

  // Should not reach here if ProtectedRoute is above in the tree,
  // but guard defensively.
  if (!user) return <Navigate to="/login" replace />

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
```

---

## 17. LAYOUT COMPONENTS

### 17.1 `src/components/layout/RoleAwareLayout.tsx` *(New in v2.0)*

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import StudentLayout    from './StudentLayout'
import InstructorLayout from './InstructorLayout'
import AdminLayout      from './AdminLayout'

/**
 * Renders the correct authenticated layout based on the user's role.
 * Used for shared routes (/messages, /profile, /notifications, etc.)
 * so that instructors and admins see their own sidebar, not the student's.
 */
export default function RoleAwareLayout() {
  const user = useAuthStore(s => s.user)

  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'admin')      return <AdminLayout />
  if (user.role === 'instructor') return <InstructorLayout />
  return <StudentLayout />
}
```

> **Note**: Each of `StudentLayout`, `InstructorLayout`, `AdminLayout` renders `<Outlet />` internally. `RoleAwareLayout` does NOT wrap an `<Outlet />` itself — the chosen layout does it.

### 17.2 `src/components/layout/AuthLayout.tsx`

Centered card, no navbar/footer. Logo top-center on mobile, split-screen on desktop.

```
┌────────────────────────────────────────────────────────┐
│  [EduFlow Logo]                        (top-left)      │
│                                                        │
│  ┌────────────────────┐    ┌─────────────────────┐    │
│  │                    │    │                     │    │
│  │   <Outlet />       │    │  Education SVG      │    │
│  │   (form content)   │    │  Illustration       │    │
│  │                    │    │  (hidden < lg)      │    │
│  └────────────────────┘    └─────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

- Background: `bg-background` with a subtle radial gradient overlay
- Form container: `max-w-md w-full p-8 bg-card rounded-2xl shadow-modal`
- Right illustration: abstract SVG with books, graduation cap, orbits. `hidden lg:flex`
- Logo → navigates to `/`
- Auth redirect: if user is already authenticated, redirect to `ROLE_DASHBOARDS[user.role]`

```typescript
// src/components/layout/AuthLayout.tsx
import { useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROLE_DASHBOARDS } from '@/lib/constants'

export default function AuthLayout() {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(ROLE_DASHBOARDS[user.role], { replace: true })
    }
  }, [isLoading, isAuthenticated, user])

  return (
    <div className="min-h-screen bg-background flex">
      {/* Form side */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="EduFlow" className="h-8" />
          </Link>
          {/* Page content (login/signup/etc.) */}
          <Outlet />
        </div>
      </div>

      {/* Illustration side (desktop only) */}
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-12">
        <AuthIllustration />
      </div>
    </div>
  )
}

function AuthIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central book */}
      <rect x="120" y="140" width="160" height="120" rx="8" fill="hsl(239 84% 67%)" opacity="0.15"/>
      <rect x="130" y="150" width="140" height="100" rx="6" fill="hsl(239 84% 67%)" opacity="0.25"/>
      <rect x="140" y="165" width="80" height="6" rx="3" fill="hsl(239 84% 67%)"/>
      <rect x="140" y="180" width="60" height="6" rx="3" fill="hsl(239 84% 67%)" opacity="0.6"/>
      <rect x="140" y="195" width="70" height="6" rx="3" fill="hsl(239 84% 67%)" opacity="0.4"/>
      {/* Graduation cap */}
      <ellipse cx="200" cy="100" rx="40" ry="8" fill="hsl(239 84% 67%)" opacity="0.4"/>
      <rect x="180" y="85" width="40" height="20" rx="3" fill="hsl(239 84% 67%)" opacity="0.3"/>
      <line x1="200" y1="108" x2="220" y2="125" stroke="hsl(38 92% 50%)" strokeWidth="2"/>
      <circle cx="220" cy="128" r="4" fill="hsl(38 92% 50%)"/>
      {/* Orbiting dots */}
      <circle cx="100" cy="200" r="8" fill="hsl(160 84% 39%)" opacity="0.5"/>
      <circle cx="300" cy="160" r="6" fill="hsl(38 92% 50%)" opacity="0.5"/>
      <circle cx="310" cy="280" r="10" fill="hsl(239 84% 67%)" opacity="0.3"/>
      <circle cx="90"  cy="300" r="7"  fill="hsl(0 84% 60%)"   opacity="0.3"/>
    </svg>
  )
}
```

### 17.3 `src/components/layout/PublicLayout.tsx`

```typescript
import { Outlet } from 'react-router-dom'
import PublicNavbar from '@/components/navigation/PublicNavbar'
import PublicFooter from '@/components/navigation/PublicFooter'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
```

### 17.4 `src/components/layout/StudentLayout.tsx`

```
┌──────────────────────────────────────────────────────────┐
│                      <Topbar />                          │  h-[60px] sticky top-0 z-40
├───────────────┬──────────────────────────────────────────┤
│               │                                          │
│  <Sidebar     │  <main>                                  │
│   role=       │    <Outlet />                            │
│   student>    │  </main>                                 │
│               │                                          │
│  w-64 desktop │  overflow-y-auto                         │
│  w-16 tablet  │  h-[calc(100vh-60px)]                    │
│  hidden mobile│                                          │
└───────────────┴──────────────────────────────────────────┘
  <MobileBottomNav role="student" />   (fixed bottom, mobile only)
```

```typescript
import { Outlet } from 'react-router-dom'
import Topbar           from '@/components/navigation/Topbar'
import Sidebar          from '@/components/navigation/Sidebar'
import MobileBottomNav  from '@/components/navigation/MobileBottomNav'

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: hidden on mobile, icon-only on tablet, full on desktop */}
        <Sidebar role="student" />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-60px)] p-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav role="student" />
    </div>
  )
}
```

### 17.5 `src/components/layout/InstructorLayout.tsx`

```typescript
import { Outlet } from 'react-router-dom'
import Topbar          from '@/components/navigation/Topbar'
import Sidebar         from '@/components/navigation/Sidebar'
import MobileBottomNav from '@/components/navigation/MobileBottomNav'

export default function InstructorLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="instructor" />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-60px)] p-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav role="instructor" />
    </div>
  )
}
```

### 17.6 `src/components/layout/AdminLayout.tsx`

```typescript
import { Outlet } from 'react-router-dom'
import Topbar          from '@/components/navigation/Topbar'
import Sidebar         from '@/components/navigation/Sidebar'
import MobileBottomNav from '@/components/navigation/MobileBottomNav'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="admin" />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-60px)] p-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  )
}
```

### 17.7 `src/components/layout/LessonLayout.tsx`

Fullscreen layout for the course player. Includes a minimal top bar for navigation back. No sidebar.

```typescript
import { Outlet, Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCoursePlayerStore } from '@/store/coursePlayerStore'
import ThemeToggle from '@/components/common/ThemeToggle'

export default function LessonLayout() {
  const { courseId } = useParams<{ courseId: string }>()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-40">
        <Link
          to={courseId ? `/learn/${courseId}` : '/student/courses'}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Course</span>
        </Link>
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src="/logo.svg" alt="EduFlow" className="h-7" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Full-height content area */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
```

---

## 18. SIDEBAR COMPONENT — `src/components/navigation/Sidebar.tsx`

### Props

```typescript
interface SidebarProps {
  role: 'student' | 'instructor' | 'admin'
}
```

### Visual spec
- Width desktop: `w-64` (256px)
- Width tablet (md): `w-16` (64px) — icon-only, labels hidden
- Mobile: `hidden` — replaced by `MobileBottomNav`
- Background: `bg-card border-r border-border`
- Nav item height: 40px, padding `px-3`
- Active: `.nav-item-active` = `bg-primary/10 text-primary font-medium border-l-2 border-primary`
- Hover (inactive): `hover:bg-muted/50 hover:text-foreground`
- Bottom: avatar + full name + role badge (hidden in icon-only mode)
- Use `<NavLink>` for automatic `isActive` detection

### Student nav items
```
Dashboard         → /student/dashboard     icon: LayoutDashboard
My Courses        → /student/courses       icon: BookOpen
Browse Catalog    → /catalog               icon: Search
Grades            → /student/grades        icon: Award
Progress          → /student/progress      icon: TrendingUp
Certificates      → /student/certificates  icon: FileCheck
Badges            → /student/badges        icon: Star
Leaderboard       → /leaderboard           icon: Trophy
Messages          → /messages              icon: MessageSquare
Notifications     → /notifications         icon: Bell    [+ unread badge]
Profile           → /profile               icon: User
```

### Instructor nav items
```
Dashboard         → /instructor/dashboard  icon: LayoutDashboard
My Courses        → /instructor/courses    icon: BookOpen
Messages          → /messages              icon: MessageSquare
Notifications     → /notifications         icon: Bell    [+ unread badge]
Profile           → /profile               icon: User
```

### Admin nav items
```
Dashboard         → /admin/dashboard       icon: LayoutDashboard
Users             → /admin/users           icon: Users
Courses           → /admin/courses         icon: BookOpen
Analytics         → /admin/analytics       icon: BarChart2
Reports           → /admin/reports         icon: FileText
Announcements     → /admin/announcements   icon: Megaphone
Settings          → /admin/settings        icon: Settings
Audit Logs        → /admin/audit-logs      icon: Shield
```

### Implementation notes
- Use `useMediaQuery` hook (`useMobile`, `useTablet`, `useDesktop`) to control visibility
- On tablet: sidebar shows, width collapses to `w-16`, labels hidden, tooltips shown on hover
- On mobile: sidebar `hidden`, `MobileBottomNav` renders instead
- Notification badge: pull `unreadCount` from `useNotificationStore`
- Tooltip in icon-only mode: wrap each item in shadcn `<Tooltip>` showing the label
- Brand logo at top of sidebar links to role dashboard
- Bottom user section: `Avatar` + name (hidden on tablet) + role `<Badge>`

---

## 19. TOPBAR COMPONENT — `src/components/navigation/Topbar.tsx`

### Visual spec (left → right)
```
[Hamburger] [Breadcrumb path]    [GlobalSearch]    [ThemeToggle] [Bell+badge] [Avatar]
```

- Height: `h-[60px]`, `sticky top-0 z-40`
- Background: `bg-card border-b border-border`
- Hamburger: `md:hidden` — toggles a mobile drawer sidebar state
- Breadcrumb: derived from `useLocation()` — split pathname by `/`, map segments via `NAV_LABELS`

### Breadcrumb logic
```typescript
// Example: /student/grades → "Student / Grades"
const { pathname } = useLocation()
const parts = pathname.split('/').filter(Boolean)
// Show last 2 segments max; capitalize via NAV_LABELS
```

### GlobalSearch
- Input: `max-w-sm`, placeholder `"Search courses, lessons…"`
- On focus: show recent searches from `localStorage.getItem('eduflow-search-history')`
- On type (debounced 300ms via `useDebounce`): filter `mockCourses` by title/description
- Dropdown: max 5 results, each showing course thumbnail + title + category
- On Enter or result click: `navigate('/search?q=' + encodeURIComponent(query))`
- On Escape: blur input, close dropdown
- Click outside: close dropdown

### ThemeToggle (in Topbar)
- Icon: `Sun` when dark mode active, `Moon` when light mode active, `Monitor` when system
- On click: `useThemeStore().toggleTheme()`
- Tooltip: shows current theme name

### NotificationBell
- Icon: `Bell` (Lucide)
- Badge: red `w-4 h-4` circle with `unreadCount` (hidden when 0, max displays "9+")
- On click: toggle `NotificationDropdown` popover

### ProfileDropdown (Avatar)
- Avatar: `<Avatar>` with `avatar_url` or `<AvatarFallback>` with initials
- On click: shadcn `<DropdownMenu>`
  - Header: user name + email (non-interactive, text only)
  - `<DropdownMenuSeparator />`
  - [My Profile] → `/profile`
  - [Settings] → `/profile` (settings tab, Phase 4)
  - `<DropdownMenuSeparator />`
  - [Log out] → calls `supabase.auth.signOut()` → `logout()` → `navigate('/login')`

---

## 20. PUBLIC NAVBAR — `src/components/navigation/PublicNavbar.tsx`

```
[EduFlow logo]    [Courses]  [Pricing]    [Login]  [Get Started →]
```

- Sticky, `h-16`, `backdrop-blur-sm bg-background/80` on scroll
- Logo → `/`
- Courses → `/catalog`
- Pricing → `/#pricing` (smooth scroll anchor)
- Login → `/login` (ghost button)
- Get Started → `/signup` (primary button)
- Mobile: hamburger icon → Sheet drawer with all links stacked vertically

```typescript
// Detect scroll for backdrop blur
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 8)
  window.addEventListener('scroll', handler)
  return () => window.removeEventListener('scroll', handler)
}, [])
```

---

## 21. MOBILE BOTTOM NAV — `src/components/navigation/MobileBottomNav.tsx`

Visible only on mobile (`md:hidden`). Fixed bottom, `z-50`.

```typescript
interface MobileBottomNavProps {
  role: 'student' | 'instructor' | 'admin'
}
```

### Student bottom nav (5 items)
```
[LayoutDashboard /student/dashboard]
[BookOpen        /student/courses]
[Search          /catalog]
[MessageSquare   /messages]
[User            /profile]
```

### Instructor bottom nav (5 items)
```
[LayoutDashboard /instructor/dashboard]
[BookOpen        /instructor/courses]
[MessageSquare   /messages]
[Bell            /notifications]   [+ unread badge]
[User            /profile]
```

### Admin bottom nav (5 items)
```
[LayoutDashboard /admin/dashboard]
[Users           /admin/users]
[BookOpen        /admin/courses]
[BarChart2       /admin/analytics]
[User            /profile]
```

- Each item: `flex-col items-center gap-0.5 text-[10px]`
- Active item: `text-primary`, inactive: `text-muted-foreground`
- Notification badge: absolute `top-0 right-0` 6px red dot (no number, mobile space is tight)
- Safe area: add `pb-[env(safe-area-inset-bottom)]` for iPhone notch support

---

## 22. NOTIFICATION DROPDOWN — `src/components/navigation/NotificationDropdown.tsx`

Triggered by the bell button in Topbar via shadcn `<Popover>`.

- Width: `w-80`
- Header: "Notifications" title + [Mark all read] button (right-aligned)
- Body: last 5 notifications from `useNotificationStore`
- Each item:
  - Left: colored icon by `NotificationType`
  - Center: `title` (semibold, truncated) + `body` (text-sm muted, truncated 60 chars) + `formatRelativeTime(created_at)`
  - Right: blue filled dot `w-2 h-2` if `!is_read`
  - On click: `markRead(id)` + navigate to `notification.link` if not null
- Empty state: `Inbox` icon + "You're all caught up!" text
- Footer: `<Link to="/notifications">View all notifications →</Link>`

### Notification type icon mapping
```
assignment_graded    → FileCheck   (green)
quiz_result          → Award       (blue)
new_announcement     → Megaphone   (amber)
new_message          → MessageSquare (purple)
enrollment_confirmed → CheckCircle  (green)
course_completed     → Trophy      (gold)
badge_earned         → Star        (yellow)
```

---

## 23. AUTH PAGES — FULL SPECIFICATIONS

### 23.1 `/login` — `src/pages/auth/LoginPage.tsx`

**Page title**: "Welcome back"
**Subtitle**: "Sign in to your EduFlow account"

**Schema**:
```typescript
const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})
type LoginForm = z.infer<typeof loginSchema>
```

**Fields** (top to bottom):
1. Email — `type="email"`, `autoComplete="email"`, placeholder `"you@example.com"`
2. Password — `type="password"` with Eye/EyeOff show-hide toggle, `autoComplete="current-password"`
3. Row: [Remember me checkbox] left + [Forgot password? →] link right

**Buttons**:
1. `[Sign In]` — full-width primary, spinner + "Signing in…" while submitting
2. Divider `"or continue with"`
3. `[Continue with Google]` — white bg, border, Google "G" SVG icon left

**Show/hide password toggle**:
```typescript
// Wrapper div must be relative; button is absolute
<div className="relative">
  <Input type={showPassword ? 'text' : 'password'} {...field} />
  <button
    type="button"
    onClick={() => setShowPassword(v => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >
    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
</div>
```

**Submit handler**:
```typescript
const { error, data } = await supabase.auth.signInWithPassword({ email, password })

if (error) {
  if (error.message.includes('Invalid login credentials')) {
    toast.error('Invalid email or password')
  } else if (error.message.includes('Email not confirmed')) {
    toast.error('Please verify your email first')
    navigate('/verify-email', { state: { email } })
  } else {
    toast.error(error.message)
  }
  return
}

// Fetch profile for role-based redirect
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', data.session!.user.id)
  .single()

// Redirect: use ?redirect= query param if present, else role dashboard
const params = new URLSearchParams(window.location.search)
const redirect = params.get('redirect')
navigate(redirect || ROLE_DASHBOARDS[profile?.role ?? 'student'], { replace: true })
```

**Google handler**:
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
    queryParams: { access_type: 'offline', prompt: 'consent' },
  },
})
```

**Bottom**: "Don't have an account? [Sign up →]" → `/signup`

---

### 23.2 `/signup` — `src/pages/auth/SignupPage.tsx`

**Page title**: "Create your account"
**Subtitle**: "Join thousands of learners on EduFlow"

**Schema**:
```typescript
const signupSchema = z.object({
  full_name:        z.string().min(2, 'Name must be at least 2 characters').max(80),
  email:            z.string().email('Please enter a valid email'),
  password:         z.string()
                     .min(8,      'Password must be at least 8 characters')
                     .regex(/[A-Z]/, 'Must contain an uppercase letter')
                     .regex(/[0-9]/, 'Must contain a number'),
  confirm_password: z.string(),
  role:             z.enum(['student', 'instructor']),
  agree:            z.boolean().refine(v => v === true, 'You must accept the terms'),
}).refine(
  d => d.password === d.confirm_password,
  { message: "Passwords don't match", path: ['confirm_password'] }
)
type SignupForm = z.infer<typeof signupSchema>
```

**Fields** (top to bottom):
1. Full Name — `autoComplete="name"`, placeholder `"Arjun Sharma"`
2. Email — `autoComplete="email"`
3. Password — with show/hide + **password strength bar** below
4. Confirm Password — with show/hide
5. Role selector — two radio cards side by side:
   - `[🎓 Student]` — "I want to learn" — border-2 border-primary when selected
   - `[📖 Instructor]` — "I want to teach" — same styling
6. Terms checkbox — "I agree to the [Terms of Service] and [Privacy Policy]"

**Password strength bar**:
```typescript
// Use getPasswordStrength() from utils.ts
const strength = getPasswordStrength(watchedPassword)
const bars = { weak: 1, medium: 2, strong: 3 }[strength]
const color = { weak: 'bg-destructive', medium: 'bg-warning', strong: 'bg-success' }[strength]

// Render 3 segment divs, fill `bars` of them with `color`
```

**Submit handler**:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name, role },                        // stored in raw_user_meta_data
    emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
  },
})

if (error) { toast.error(error.message); return }

// Detect "already registered" — Supabase returns a user with no identities
if (data.user && data.user.identities?.length === 0) {
  toast.error('An account with this email already exists')
  navigate('/login')
  return
}

navigate('/verify-email', { state: { email } })
```

> **Note**: Google OAuth signup always creates a `student` role because Google's user metadata does not include a role field. Users who want `instructor` access after Google signup must contact an admin to update their role in the admin panel.

**Bottom**: "Already have an account? [Sign in →]" → `/login`

---

### 23.3 `/forgot-password` — `src/pages/auth/ForgotPasswordPage.tsx`

**Page title**: "Reset your password"
**Subtitle**: "Enter your email and we'll send a reset link"

**States**: `default` (form shown) | `sent` (success message shown)

**Schema**: `z.object({ email: z.string().email('Please enter a valid email') })`

**Submit handler**:
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
})
// Always show success — never reveal whether the email exists (security)
setSent(true)
```

**Success state UI**:
- Large `Mail` icon (primary color)
- "Check your inbox! We sent a reset link to **{email}**"
- `[Resend email]` — disabled for 60s, shows countdown timer
- `[← Back to Login]` → `/login`

**60-second resend countdown**:
```typescript
const [cooldown, setCooldown] = useState(0)

function startCooldown() {
  setCooldown(60)
  const interval = setInterval(() => {
    setCooldown(v => {
      if (v <= 1) { clearInterval(interval); return 0 }
      return v - 1
    })
  }, 1000)
}

// On successful send: startCooldown()
// Resend button: disabled={cooldown > 0}, label: cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'
```

**Always visible**: `[← Back to Login]` text link above the submit button.

---

### 23.4 `/reset-password` — `src/pages/auth/ResetPasswordPage.tsx`

**Page title**: "Set new password"
**Subtitle**: "Choose a strong password for your account"

**Critical**: User arrives via email link containing a PKCE code. The page must:
1. Listen for the `PASSWORD_RECOVERY` auth event
2. Show a loading spinner until `isReady = true`
3. If 10 seconds pass without the event, show an error

```typescript
const [isReady, setIsReady] = useState(false)
const [timedOut, setTimedOut] = useState(false)

useEffect(() => {
  // 10-second timeout
  const timeout = setTimeout(() => {
    if (!isReady) setTimedOut(true)
  }, 10_000)

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      setIsReady(true)
      clearTimeout(timeout)
    }
  })

  return () => {
    subscription.unsubscribe()
    clearTimeout(timeout)
  }
}, [])
```

**States**:
- Loading (`!isReady && !timedOut`): spinner + "Verifying your reset link…"
- Timed out (`timedOut`): lock icon + "This link is invalid or has expired." + `[Request new link →]` → `/forgot-password`
- Ready (`isReady`): show the new password form

**Schema**:
```typescript
z.object({
  password:         z.string()
                     .min(8, 'Password must be at least 8 characters')
                     .regex(/[A-Z]/, 'Must contain an uppercase letter')
                     .regex(/[0-9]/, 'Must contain a number'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path:    ['confirm_password'],
})
```

**Submit handler**:
```typescript
const { error } = await supabase.auth.updateUser({ password })
if (error) { toast.error(error.message); return }
toast.success('Password updated successfully!')
navigate('/login')
```

---

### 23.5 `/verify-email` — `src/pages/auth/VerifyEmailPage.tsx`

**Page title**: "Check your email"

Get the email from `useLocation().state?.email` or `new URLSearchParams(search).get('email')`.

**States**: `pending` | `verified`

```typescript
const [verified, setVerified] = useState(false)

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await getCurrentProfile()
        setUser(profile)         // from useAuthStore
        setVerified(true)
      }
    }
  )
  return () => subscription.unsubscribe()
}, [])
```

**Pending state UI**:
- `Mail` icon (64px, primary color)
- "We sent a verification email to **{email}**"
- "Click the link in the email to verify your account. Check your spam folder if you don't see it."
- `[Resend verification email]` — 60s cooldown (same pattern as §23.3)
  - `await supabase.auth.resend({ type: 'signup', email })`
  - `toast.success('Verification email resent!')`
- `[Use a different email →]` → `/signup`

**Verified state UI**:
- Green `CheckCircle` icon (64px) with a brief scale animation (`animate-bounce` once)
- "Email verified successfully! 🎉"
- `[Go to Dashboard →]` → `ROLE_DASHBOARDS[user!.role]`

---

### 23.6 `/auth/callback` — `src/pages/auth/AuthCallbackPage.tsx`

No layout. Handles PKCE code exchange for OAuth logins and email confirmation redirects.

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getCurrentProfile } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ROLE_DASHBOARDS } from '@/lib/constants'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      // Exchange the PKCE code for a session
      // Note: detectSessionInUrl is false in supabase.ts, so we do this manually
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(
        window.location.search  // contains ?code=...
      )

      if (error || !session) {
        console.error('[AuthCallback] exchange failed:', error?.message)
        navigate('/login?error=auth_failed', { replace: true })
        return
      }

      const profile = await getCurrentProfile()
      setUser(profile)
      navigate(ROLE_DASHBOARDS[profile?.role ?? 'student'], { replace: true })
    }

    handleCallback()
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Completing sign in…</p>
    </div>
  )
}
```

---

## 24. ERROR PAGES

### 24.1 `/403` — `src/pages/errors/ForbiddenPage.tsx`

```typescript
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { ROLE_DASHBOARDS } from '@/lib/constants'

export default function ForbiddenPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <Lock className="w-10 h-10 text-destructive" />
      </div>
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground">403</h1>
        <h2 className="text-xl font-heading font-semibold mt-1">Access Denied</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          You don't have permission to view this page.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>← Go Back</Button>
        <Button onClick={() => navigate(user ? ROLE_DASHBOARDS[user.role] : '/')}>
          Go Home
        </Button>
      </div>
    </div>
  )
}
```

### 24.2 `/404` — `src/pages/errors/NotFoundPage.tsx`

```typescript
import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { ROLE_DASHBOARDS } from '@/lib/constants'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <Compass className="w-10 h-10 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground">404</h1>
        <h2 className="text-xl font-heading font-semibold mt-1">Page Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button onClick={() => navigate(user ? ROLE_DASHBOARDS[user.role] : '/')}>
        Go Home
      </Button>
    </div>
  )
}
```

---

## 25. STUB PAGE TEMPLATE

Every page not fully built in Phase 1 must use this exact template:

```typescript
// Example: src/pages/student/GradesPage.tsx
import PageHeader from '@/components/common/PageHeader'

export default function StudentGradesPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Grades"
        description="Track your quiz and assignment scores across all courses."
      />
      <div className="mt-8 p-8 rounded-xl border border-dashed border-border flex flex-col items-center gap-3 text-muted-foreground">
        <span className="text-4xl">🚧</span>
        <p className="font-medium">Student Grades</p>
        <p className="text-sm">Full implementation in Phase 3</p>
      </div>
    </div>
  )
}
```

Apply this pattern to every stub page, filling in the appropriate `title`, `description`, and phase number.

### Stub page quick reference

| File | Title | Description | Phase |
|------|-------|-------------|-------|
| `student/DashboardPage.tsx` | Dashboard | Welcome back! Here's your learning overview. | 3 |
| `student/CoursesPage.tsx` | My Courses | Continue where you left off. | 3 |
| `student/GradesPage.tsx` | Grades | Track your scores across all courses. | 3 |
| `student/ProgressPage.tsx` | Progress | Visualize your learning journey. | 3 |
| `student/CertificatesPage.tsx` | Certificates | Download your earned certificates. | 3 |
| `student/BadgesPage.tsx` | Badges | Achievements you've unlocked. | 3 |
| `student/AnnouncementsPage.tsx` | Announcements | Stay up to date with your courses. | 3 |
| `learn/CourseOverviewPage.tsx` | Course Overview | All modules and lessons in one place. | 5 |
| `learn/LessonPlayerPage.tsx` | Lesson Player | Watch, read, and take notes. | 5 |
| `learn/QuizPage.tsx` | Quiz | Test your knowledge. | 5 |
| `learn/AssignmentPage.tsx` | Assignment | Submit your work for grading. | 5 |
| `instructor/DashboardPage.tsx` | Instructor Dashboard | Your course performance at a glance. | 3 |
| `instructor/CoursesPage.tsx` | My Courses | Manage and publish your courses. | 4 |
| `instructor/NewCoursePage.tsx` | New Course | Build your new course from scratch. | 4 |
| `instructor/CourseHubPage.tsx` | Course Hub | Edit modules, quizzes, and students. | 4 |
| `admin/DashboardPage.tsx` | Admin Dashboard | Platform-wide metrics and health. | 3 |
| `admin/UsersPage.tsx` | Users | Manage all users on the platform. | 4 |
| `admin/NewUserPage.tsx` | New User | Create a new user account. | 4 |
| `admin/UserDetailPage.tsx` | User Detail | View and edit user details. | 4 |
| `admin/BulkImportPage.tsx` | Bulk Import | Import users via CSV. | 4 |
| `admin/CoursesPage.tsx` | All Courses | Review and manage all courses. | 4 |
| `admin/AnalyticsPage.tsx` | Analytics | Deep-dive into platform data. | 6 |
| `admin/ReportsPage.tsx` | Reports | Generate and export reports. | 6 |
| `admin/AnnouncementsPage.tsx` | Announcements | Broadcast messages to users. | 4 |
| `admin/SettingsPage.tsx` | Settings | Configure platform settings. | 4 |
| `admin/AuditLogsPage.tsx` | Audit Logs | Full history of admin actions. | 4 |
| `shared/MessagesPage.tsx` | Messages | Direct messages with your peers. | 4 |
| `shared/NotificationsPage.tsx` | Notifications | All your notifications. | 3 |
| `shared/LeaderboardPage.tsx` | Leaderboard | Top learners on EduFlow. | 3 |
| `shared/ProfilePage.tsx` | My Profile | Edit your account details. | 4 |
| `shared/SearchPage.tsx` | Search Results | Find courses and lessons. | 2 |
| `shared/ForumPage.tsx` | Forum | Discuss this course with peers. | 5 |
| `shared/ForumThreadPage.tsx` | Thread | Read and reply to the discussion. | 5 |
| `public/LandingPage.tsx` | EduFlow | Learn anything, anywhere. | 2 |
| `public/CatalogPage.tsx` | Course Catalog | Browse all available courses. | 2 |
| `public/CourseDetailPage.tsx` | Course Detail | Everything you need to know. | 2 |

---

## 26. COMMON COMPONENTS

### 26.1 `src/components/common/PageHeader.tsx`

```typescript
interface PageHeaderProps {
  title:        string
  description?: string
  actions?:     React.ReactNode  // buttons/controls rendered on the right
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
```

### 26.2 `src/components/common/EmptyState.tsx`

```typescript
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?:       React.ReactNode
  title:       string
  description: string
  action?:     { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center max-w-sm mx-auto">
      <div className="text-muted-foreground">
        {icon ?? <Inbox className="w-12 h-12" />}
      </div>
      <h3 className="font-heading font-medium text-lg text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-2">{action.label}</Button>
      )}
    </div>
  )
}
```

### 26.3 `src/components/common/ErrorState.tsx` *(Added in v2.0)*

```typescript
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?:       string
  description?: string
  onRetry?:     () => void
}

export default function ErrorState({
  title       = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h3 className="font-heading font-medium text-lg text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  )
}
```

### 26.4 `src/components/common/SkeletonPage.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page title skeleton */}
      <Skeleton className="h-7 w-48 rounded-lg" />
      <Skeleton className="h-4 w-72 rounded" />

      {/* Card grid skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 26.5 `src/components/common/ThemeToggle.tsx`

```typescript
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useThemeStore, type Theme } from '@/store/themeStore'

const ICONS: Record<Theme, React.ReactNode> = {
  light:  <Sun className="w-4 h-4" />,
  dark:   <Moon className="w-4 h-4" />,
  system: <Monitor className="w-4 h-4" />,
}

const LABELS: Record<Theme, string> = {
  light:  'Light mode',
  dark:   'Dark mode',
  system: 'System theme',
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={`Current: ${LABELS[theme]}. Click to switch.`}
        >
          {ICONS[theme]}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{LABELS[theme]}</TooltipContent>
    </Tooltip>
  )
}
```

---

## 27. MOCK DATA — `src/lib/mockData.ts`

All mock data must satisfy the TypeScript types in `src/lib/types.ts`. Use ISO date strings throughout.

```typescript
import type {
  Profile, Course, Module, Lesson, Quiz, Assignment,
  Enrollment, Notification, Announcement, Conversation, Message,
  ForumThread, Certificate, Badge, UserBadge, LeaderboardEntry,
  AdminKPIs, AuditLog,
} from './types'

// ─── USERS (one per role) ────────────────────────────────────────────────────

export const mockUsers = {
  student: {
    id: 'u-student-01', email: 'arjun@demo.com', full_name: 'Arjun Sharma',
    avatar_url: null, role: 'student', bio: 'Aspiring full-stack developer from Bengaluru.',
    department: 'Engineering', is_active: true,
    created_at: '2024-01-15T10:00:00Z', updated_at: '2024-03-10T08:00:00Z',
  } as Profile,

  instructor: {
    id: 'u-instructor-01', email: 'priya@demo.com', full_name: 'Priya Mehta',
    avatar_url: null, role: 'instructor', bio: '10 years of industry experience in React & Node.js.',
    department: 'Technology', is_active: true,
    created_at: '2023-06-01T09:00:00Z', updated_at: '2024-02-20T12:00:00Z',
  } as Profile,

  admin: {
    id: 'u-admin-01', email: 'rahul@demo.com', full_name: 'Rahul Verma',
    avatar_url: null, role: 'admin', bio: 'Platform administrator.',
    department: 'Operations', is_active: true,
    created_at: '2023-01-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z',
  } as Profile,
}

// ─── COURSES (6 entries, mix of free/paid, multiple categories) ──────────────

export const mockCourses: Course[] = [
  {
    id: 'c-01', title: 'Complete React Developer in 2024',
    description: 'Master React from zero to hero. Hooks, context, testing, and deployment.',
    thumbnail_url: null, instructor_id: 'u-instructor-01',
    instructor: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null },
    category: 'programming', level: 'intermediate', pricing_type: 'paid', price: 1499,
    status: 'published', tags: ['react', 'javascript', 'frontend'],
    duration_minutes: 1800, lesson_count: 62, enrollment_count: 3241,
    rating: 4.8, rating_count: 512, created_at: '2024-01-10T00:00:00Z', updated_at: '2024-03-01T00:00:00Z',
    what_you_learn: ['Build real-world React apps', 'Understand hooks deeply', 'Write tests with Jest', 'Deploy to Vercel'],
    requirements: ['Basic JavaScript knowledge', 'Familiarity with HTML/CSS'],
  },
  {
    id: 'c-02', title: 'Python for Data Science — Beginner to Pro',
    description: 'Learn Python, NumPy, Pandas, Matplotlib, and Scikit-learn with hands-on projects.',
    thumbnail_url: null, instructor_id: 'u-instructor-01',
    instructor: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null },
    category: 'data-science', level: 'beginner', pricing_type: 'paid', price: 1299,
    status: 'published', tags: ['python', 'data-science', 'ml'],
    duration_minutes: 1560, lesson_count: 48, enrollment_count: 5102,
    rating: 4.6, rating_count: 890, created_at: '2023-09-15T00:00:00Z', updated_at: '2024-02-10T00:00:00Z',
    what_you_learn: ['Data analysis with Pandas', 'Visualization with Matplotlib', 'ML basics with Scikit-learn'],
    requirements: ['No prior programming experience required'],
  },
  {
    id: 'c-03', title: 'UI/UX Design Fundamentals',
    description: 'Learn design thinking, wireframing, prototyping with Figma, and usability testing.',
    thumbnail_url: null, instructor_id: 'u-instructor-01',
    instructor: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null },
    category: 'design', level: 'beginner', pricing_type: 'free', price: 0,
    status: 'published', tags: ['design', 'figma', 'ux'],
    duration_minutes: 720, lesson_count: 24, enrollment_count: 8901,
    rating: 4.9, rating_count: 1200, created_at: '2023-07-01T00:00:00Z', updated_at: '2024-01-20T00:00:00Z',
    what_you_learn: ['Design thinking process', 'Figma fundamentals', 'Usability heuristics'],
    requirements: ['No experience needed'],
  },
  {
    id: 'c-04', title: 'AWS Cloud Practitioner Certification Prep',
    description: 'Full preparation course for the AWS CCP exam — services, pricing, security, and support.',
    thumbnail_url: null, instructor_id: 'u-instructor-01',
    instructor: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null },
    category: 'programming', level: 'intermediate', pricing_type: 'paid', price: 1999,
    status: 'published', tags: ['aws', 'cloud', 'certification'],
    duration_minutes: 900, lesson_count: 35, enrollment_count: 1890,
    rating: 4.7, rating_count: 340, created_at: '2024-02-01T00:00:00Z', updated_at: '2024-03-05T00:00:00Z',
    what_you_learn: ['Core AWS services (EC2, S3, RDS)', 'IAM and security', 'Billing and pricing models'],
    requirements: ['Basic IT concepts'],
  },
  {
    id: 'c-05', title: 'Digital Marketing Mastery',
    description: 'SEO, Google Ads, Meta Ads, email marketing, and analytics in one comprehensive course.',
    thumbnail_url: null, instructor_id: 'u-instructor-01',
    instructor: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null },
    category: 'marketing', level: 'beginner', pricing_type: 'paid', price: 999,
    status: 'published', tags: ['marketing', 'seo', 'ads'],
    duration_minutes: 1200, lesson_count: 40, enrollment_count: 2760,
    rating: 4.5, rating_count: 422, created_at: '2023-11-10T00:00:00Z', updated_at: '2024-02-28T00:00:00Z',
    what_you_learn: ['Keyword research and SEO', 'Run Google Ads campaigns', 'Email automation'],
    requirements: ['Basic computer skills'],
  },
  {
    id: 'c-06', title: 'Advanced TypeScript Patterns',
    description: 'Generics, decorators, conditional types, mapped types, and enterprise patterns.',
    thumbnail_url: null, instructor_id: 'u-instructor-01',
    instructor: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null },
    category: 'programming', level: 'advanced', pricing_type: 'paid', price: 1799,
    status: 'draft', tags: ['typescript', 'advanced', 'patterns'],
    duration_minutes: 600, lesson_count: 20, enrollment_count: 0,
    rating: 0, rating_count: 0, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-15T00:00:00Z',
    what_you_learn: ['Complex generics', 'Mapped and conditional types', 'Decorator patterns'],
    requirements: ['TypeScript basics', '2+ years JavaScript experience'],
  },
]

// ─── MODULES & LESSONS (for c-01 and c-02) ──────────────────────────────────

export const mockModules: Module[] = [
  {
    id: 'm-01', course_id: 'c-01', title: 'Getting Started with React', order_index: 1,
    lessons: [
      { id: 'l-01', module_id: 'm-01', course_id: 'c-01', title: 'What is React and Why Use It?', type: 'video', content_url: null, content_text: null, duration_minutes: 12, order_index: 1, is_free_preview: true, created_at: '2024-01-10T00:00:00Z' },
      { id: 'l-02', module_id: 'm-01', course_id: 'c-01', title: 'Setting Up the Development Environment', type: 'video', content_url: null, content_text: null, duration_minutes: 15, order_index: 2, is_free_preview: true, created_at: '2024-01-10T00:00:00Z' },
      { id: 'l-03', module_id: 'm-01', course_id: 'c-01', title: 'Your First React Component', type: 'video', content_url: null, content_text: null, duration_minutes: 20, order_index: 3, is_free_preview: false, created_at: '2024-01-10T00:00:00Z' },
    ],
  },
  {
    id: 'm-02', course_id: 'c-01', title: 'React Hooks Deep Dive', order_index: 2,
    lessons: [
      { id: 'l-04', module_id: 'm-02', course_id: 'c-01', title: 'useState and useEffect', type: 'video', content_url: null, content_text: null, duration_minutes: 35, order_index: 1, is_free_preview: false, created_at: '2024-01-12T00:00:00Z' },
      { id: 'l-05', module_id: 'm-02', course_id: 'c-01', title: 'Custom Hooks', type: 'video', content_url: null, content_text: null, duration_minutes: 28, order_index: 2, is_free_preview: false, created_at: '2024-01-12T00:00:00Z' },
      { id: 'l-06', module_id: 'm-02', course_id: 'c-01', title: 'Hooks Quiz', type: 'quiz', content_url: null, content_text: null, duration_minutes: 10, order_index: 3, is_free_preview: false, created_at: '2024-01-12T00:00:00Z' },
    ],
  },
  {
    id: 'm-03', course_id: 'c-01', title: 'State Management', order_index: 3,
    lessons: [
      { id: 'l-07', module_id: 'm-03', course_id: 'c-01', title: 'Context API', type: 'video', content_url: null, content_text: null, duration_minutes: 22, order_index: 1, is_free_preview: false, created_at: '2024-01-15T00:00:00Z' },
      { id: 'l-08', module_id: 'm-03', course_id: 'c-01', title: 'Introduction to Zustand', type: 'text', content_url: null, content_text: '# Zustand\nZustand is a minimal state management library...', duration_minutes: 8, order_index: 2, is_free_preview: false, created_at: '2024-01-15T00:00:00Z' },
    ],
  },
]

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

export const mockQuiz: Quiz = {
  id: 'q-01', lesson_id: 'l-06', course_id: 'c-01',
  title: 'React Hooks Knowledge Check', time_limit: 15, max_attempts: 3, pass_score: 70,
  created_at: '2024-01-12T00:00:00Z',
  questions: [
    { id: 'qq-01', quiz_id: 'q-01', type: 'mcq', text: 'Which hook is used to manage state in a function component?', options: ['useEffect', 'useState', 'useContext', 'useRef'], correct: 'useState', explanation: 'useState returns a state variable and a setter function.', order_index: 1, points: 20 },
    { id: 'qq-02', quiz_id: 'q-01', type: 'true_false', text: 'useEffect runs after every render by default.', options: ['True', 'False'], correct: 'True', explanation: 'Without a dependency array, useEffect runs after every render.', order_index: 2, points: 20 },
    { id: 'qq-03', quiz_id: 'q-01', type: 'mcq', text: 'What is the correct way to run useEffect only once?', options: ['useEffect(fn)', 'useEffect(fn, null)', 'useEffect(fn, [])', 'useEffect(fn, undefined)'], correct: 'useEffect(fn, [])', explanation: 'An empty dependency array means the effect runs only on mount.', order_index: 3, points: 20 },
    { id: 'qq-04', quiz_id: 'q-01', type: 'mcq', text: 'Custom hooks must start with:', options: ['use', 'get', 'handle', 'fetch'], correct: 'use', explanation: 'The "use" prefix is required for React to identify hooks.', order_index: 4, points: 20 },
    { id: 'qq-05', quiz_id: 'q-01', type: 'true_false', text: 'You can call hooks inside if statements.', options: ['True', 'False'], correct: 'False', explanation: 'Hooks must be called at the top level, never inside conditionals.', order_index: 5, points: 20 },
  ],
}

// ─── ASSIGNMENT ──────────────────────────────────────────────────────────────

export const mockAssignment = {
  id: 'a-01', lesson_id: 'l-03', course_id: 'c-01',
  title: 'Build a Todo App with React',
  description: 'Create a fully functional Todo application using React hooks. Requirements: add/delete/toggle todos, persist to localStorage, responsive design.',
  due_date: '2024-04-01T23:59:00Z', max_score: 100,
  rubric: [
    { id: 'r-01', title: 'Functionality', description: 'Add, delete, toggle todos work correctly', max_points: 40 },
    { id: 'r-02', title: 'Code Quality', description: 'Clean, readable, well-commented code', max_points: 30 },
    { id: 'r-03', title: 'UI/UX', description: 'Clean, responsive, intuitive interface', max_points: 30 },
  ],
  created_at: '2024-01-15T00:00:00Z',
}

// ─── ENROLLMENTS (4 — for the mock student) ──────────────────────────────────

export const mockEnrollments: Enrollment[] = [
  { id: 'e-01', user_id: 'u-student-01', course_id: 'c-01', course: mockCourses[0], status: 'active',    progress: 42, enrolled_at: '2024-01-20T00:00:00Z', completed_at: null },
  { id: 'e-02', user_id: 'u-student-01', course_id: 'c-02', course: mockCourses[1], status: 'active',    progress: 78, enrolled_at: '2024-01-25T00:00:00Z', completed_at: null },
  { id: 'e-03', user_id: 'u-student-01', course_id: 'c-03', course: mockCourses[2], status: 'completed', progress: 100, enrolled_at: '2023-11-01T00:00:00Z', completed_at: '2024-02-15T00:00:00Z' },
  { id: 'e-04', user_id: 'u-student-01', course_id: 'c-05', course: mockCourses[4], status: 'active',    progress: 15, enrolled_at: '2024-03-01T00:00:00Z', completed_at: null },
]

// ─── NOTIFICATIONS (10 — mix of types) ───────────────────────────────────────

export const mockNotifications: Notification[] = [
  { id: 'n-01', user_id: 'u-student-01', type: 'badge_earned',        title: 'New Badge Unlocked!',        body: 'You earned the "Fast Learner" badge for completing 3 lessons in one day.', link: '/student/badges',                    is_read: false, created_at: '2024-03-15T09:00:00Z' },
  { id: 'n-02', user_id: 'u-student-01', type: 'assignment_graded',   title: 'Assignment Graded',           body: 'Your "Todo App" submission scored 88/100. Check instructor feedback.',    link: '/student/grades',                    is_read: false, created_at: '2024-03-14T14:30:00Z' },
  { id: 'n-03', user_id: 'u-student-01', type: 'new_announcement',    title: 'Platform Maintenance',        body: 'Scheduled maintenance on March 20, 2–4 AM IST. Plan accordingly.',         link: '/student/announcements',             is_read: false, created_at: '2024-03-14T11:00:00Z' },
  { id: 'n-04', user_id: 'u-student-01', type: 'quiz_result',         title: 'Quiz Result: 80%',            body: 'You scored 80% on the React Hooks Knowledge Check. You passed!',          link: '/student/grades',                    is_read: true,  created_at: '2024-03-13T16:00:00Z' },
  { id: 'n-05', user_id: 'u-student-01', type: 'new_message',         title: 'New message from Priya Mehta', body: 'Great progress on Module 2! Keep it up.',                               link: '/messages',                          is_read: true,  created_at: '2024-03-12T10:00:00Z' },
  { id: 'n-06', user_id: 'u-student-01', type: 'enrollment_confirmed', title: 'Enrolled Successfully',      body: 'You are now enrolled in "Digital Marketing Mastery". Start learning!',    link: '/student/courses',                   is_read: true,  created_at: '2024-03-01T08:00:00Z' },
  { id: 'n-07', user_id: 'u-student-01', type: 'course_completed',    title: 'Course Completed!',           body: 'Congratulations! You completed "UI/UX Design Fundamentals".',            link: '/student/certificates',              is_read: true,  created_at: '2024-02-15T18:00:00Z' },
  { id: 'n-08', user_id: 'u-student-01', type: 'assignment_graded',   title: 'Assignment Returned',         body: 'Your Python project was returned with feedback. Review and resubmit.',    link: '/student/grades',                    is_read: true,  created_at: '2024-02-10T12:00:00Z' },
  { id: 'n-09', user_id: 'u-student-01', type: 'new_announcement',    title: 'New Course Available',        body: 'Advanced TypeScript Patterns is now in our catalog. Check it out!',       link: '/catalog',                           is_read: true,  created_at: '2024-03-01T09:00:00Z' },
  { id: 'n-10', user_id: 'u-student-01', type: 'badge_earned',        title: 'First Steps Badge',           body: 'You earned the "First Steps" badge for completing your first lesson!',   link: '/student/badges',                    is_read: true,  created_at: '2024-01-20T15:00:00Z' },
]

// ─── ANNOUNCEMENTS (5) ───────────────────────────────────────────────────────

export const mockAnnouncements: Announcement[] = [
  { id: 'an-01', author_id: 'u-admin-01', author: { id: 'u-admin-01', full_name: 'Rahul Verma', avatar_url: null }, title: 'Scheduled Maintenance — March 20', content: '<p>EduFlow will undergo scheduled maintenance on <strong>March 20, 2024 from 2–4 AM IST</strong>. Some features may be temporarily unavailable. We apologize for any inconvenience.</p>', audience: 'all', course_id: null, is_pinned: true,  created_at: '2024-03-14T11:00:00Z' },
  { id: 'an-02', author_id: 'u-instructor-01', author: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null }, title: 'React Course — New Module Added', content: '<p>I have added a new module on <strong>Performance Optimization</strong> with useMemo, useCallback, and React.memo. Check it out!</p>', audience: 'course', course_id: 'c-01', is_pinned: false, created_at: '2024-03-10T09:00:00Z' },
  { id: 'an-03', author_id: 'u-admin-01', author: { id: 'u-admin-01', full_name: 'Rahul Verma', avatar_url: null }, title: 'Welcome to EduFlow!', content: '<p>We are thrilled to have you on EduFlow. Start your learning journey today by browsing our course catalog. Happy learning! 🎓</p>', audience: 'students', course_id: null, is_pinned: false, created_at: '2023-06-01T00:00:00Z' },
  { id: 'an-04', author_id: 'u-admin-01', author: { id: 'u-admin-01', full_name: 'Rahul Verma', avatar_url: null }, title: 'New Instructor Onboarding Guide', content: '<p>We have updated the instructor onboarding guide. Please review the new content creation guidelines and rubric standards in your instructor dashboard.</p>', audience: 'instructors', course_id: null, is_pinned: false, created_at: '2024-02-01T08:00:00Z' },
  { id: 'an-05', author_id: 'u-instructor-01', author: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null }, title: 'Python Course — Project Deadline Extended', content: '<p>The final project submission deadline for <em>Python for Data Science</em> has been extended to <strong>April 15, 2024</strong>. Use this time wisely!</p>', audience: 'course', course_id: 'c-02', is_pinned: false, created_at: '2024-03-12T14:00:00Z' },
]

// ─── MESSAGES / CONVERSATIONS ────────────────────────────────────────────────

export const mockConversations: Conversation[] = [
  {
    id: 'conv-01',
    participants: [
      { id: 'u-student-01', full_name: 'Arjun Sharma',   avatar_url: null },
      { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null },
    ],
    last_message: {
      id: 'msg-02', conversation_id: 'conv-01', sender_id: 'u-instructor-01',
      sender: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null },
      content: 'Great progress on Module 2! Keep it up.', file_url: null,
      created_at: '2024-03-12T10:00:00Z', read_at: null,
    },
    unread_count: 1, updated_at: '2024-03-12T10:00:00Z',
  },
]

// ─── FORUM THREADS (10) ──────────────────────────────────────────────────────

export const mockThreads: ForumThread[] = [
  { id: 'ft-01', course_id: 'c-01', author: { id: 'u-student-01', full_name: 'Arjun Sharma', avatar_url: null }, title: 'Why does useEffect run twice in development?', content: 'I noticed useEffect fires twice in dev mode. Is this a bug?', tag: 'question', upvotes: 18, reply_count: 6, is_pinned: false, is_answered: true,  created_at: '2024-02-20T10:00:00Z' },
  { id: 'ft-02', course_id: 'c-01', author: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null }, title: '📌 Course Resources and Useful Links', content: 'Official docs, cheat sheets, and project starter repos all in one place.', tag: 'resource', upvotes: 45, reply_count: 2, is_pinned: true,  is_answered: false, created_at: '2024-01-15T00:00:00Z' },
  { id: 'ft-03', course_id: 'c-01', author: { id: 'u-student-01', full_name: 'Arjun Sharma', avatar_url: null }, title: 'Discussing React vs Vue in 2024', content: 'What are your thoughts on React vs Vue for new projects?', tag: 'discussion', upvotes: 12, reply_count: 8, is_pinned: false, is_answered: false, created_at: '2024-03-05T09:00:00Z' },
]

// ─── CERTIFICATES (5) ────────────────────────────────────────────────────────

export const mockCertificates: Certificate[] = [
  {
    id: 'cert-01', user_id: 'u-student-01', course_id: 'c-03',
    course: { id: 'c-03', title: 'UI/UX Design Fundamentals', instructor: { id: 'u-instructor-01', full_name: 'Priya Mehta', avatar_url: null } },
    issued_at: '2024-02-15T18:00:00Z',
    pdf_url: '/certificates/cert-01.pdf',
    credential_id: 'EF-2024-C03-001',
  },
]

// ─── BADGES ──────────────────────────────────────────────────────────────────

export const mockBadges: Badge[] = [
  { id: 'b-01', name: 'First Steps',     description: 'Complete your first lesson',         icon_url: '🎯', color: '#6366F1', condition: 'Complete 1 lesson' },
  { id: 'b-02', name: 'Fast Learner',    description: 'Complete 3 lessons in one day',      icon_url: '⚡', color: '#F59E0B', condition: 'Complete 3 lessons in 24 hours' },
  { id: 'b-03', name: 'Course Graduate', description: 'Complete your first course',         icon_url: '🎓', color: '#10B981', condition: 'Complete 1 course' },
  { id: 'b-04', name: 'Quiz Master',     description: 'Score 100% on any quiz',             icon_url: '🏆', color: '#F59E0B', condition: 'Score 100% on a quiz' },
  { id: 'b-05', name: 'Streak Warrior',  description: 'Maintain a 7-day learning streak',  icon_url: '🔥', color: '#EF4444', condition: '7-day streak' },
  { id: 'b-06', name: 'Top Learner',     description: 'Rank in top 10 on leaderboard',     icon_url: '⭐', color: '#6366F1', condition: 'Top 10 rank' },
  { id: 'b-07', name: 'Social Butterfly', description: 'Post 5 forum replies',              icon_url: '💬', color: '#8B5CF6', condition: '5 forum replies' },
  { id: 'b-08', name: 'Perfect Score',   description: 'Submit an assignment graded 100%',  icon_url: '💯', color: '#10B981', condition: '100/100 assignment' },
]

export const mockUserBadges: UserBadge[] = [
  { id: 'ub-01', user_id: 'u-student-01', badge: mockBadges[0], earned_at: '2024-01-20T15:00:00Z' },
  { id: 'ub-02', user_id: 'u-student-01', badge: mockBadges[1], earned_at: '2024-03-15T09:00:00Z' },
  { id: 'ub-03', user_id: 'u-student-01', badge: mockBadges[2], earned_at: '2024-02-15T18:00:00Z' },
  { id: 'ub-04', user_id: 'u-student-01', badge: mockBadges[4], earned_at: '2024-02-22T08:00:00Z' },
  { id: 'ub-05', user_id: 'u-student-01', badge: mockBadges[6], earned_at: '2024-03-10T12:00:00Z' },
  // b-04, b-06, b-08 are locked (not earned yet)
]

// ─── LEADERBOARD (top 10) ────────────────────────────────────────────────────

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1,  user: { id: 'u-02', full_name: 'Sneha Patel',    avatar_url: null }, points: 4820, badges: 7, courses: 6 },
  { rank: 2,  user: { id: 'u-03', full_name: 'Vikram Nair',    avatar_url: null }, points: 4310, badges: 6, courses: 5 },
  { rank: 3,  user: { id: 'u-04', full_name: 'Aarti Joshi',    avatar_url: null }, points: 3990, badges: 5, courses: 5 },
  { rank: 4,  user: { id: 'u-student-01', full_name: 'Arjun Sharma', avatar_url: null }, points: 3540, badges: 5, courses: 4 },
  { rank: 5,  user: { id: 'u-05', full_name: 'Rohan Gupta',    avatar_url: null }, points: 3210, badges: 4, courses: 4 },
  { rank: 6,  user: { id: 'u-06', full_name: 'Kavya Reddy',    avatar_url: null }, points: 2980, badges: 4, courses: 3 },
  { rank: 7,  user: { id: 'u-07', full_name: 'Arun Kumar',     avatar_url: null }, points: 2750, badges: 3, courses: 3 },
  { rank: 8,  user: { id: 'u-08', full_name: 'Deepika Singh',  avatar_url: null }, points: 2500, badges: 3, courses: 3 },
  { rank: 9,  user: { id: 'u-09', full_name: 'Manish Tiwari',  avatar_url: null }, points: 2210, badges: 2, courses: 2 },
  { rank: 10, user: { id: 'u-10', full_name: 'Pallavi Desai',  avatar_url: null }, points: 1980, badges: 2, courses: 2 },
]

// ─── ADMIN KPIs ──────────────────────────────────────────────────────────────

export const mockAdminKPIs: AdminKPIs = {
  total_users:        1248,
  new_users_7d:       47,
  active_users:       892,
  total_courses:      38,
  total_enrollments:  4721,
  completion_rate:    68,
  avg_score:          79,
  total_revenue:      2840000,   // INR (28.4 lakh)
  mrr:                420000,    // INR (4.2 lakh MRR)
  certificates_issued: 892,
}

// ─── AUDIT LOGS (15 entries) ─────────────────────────────────────────────────

export const mockAuditLogs: AuditLog[] = [
  { id: 'al-01', user_id: 'u-admin-01', user: { id: 'u-admin-01', full_name: 'Rahul Verma', role: 'admin' }, action: 'user.created',     resource: 'user',   resource_id: 'u-11', ip_address: '103.21.44.1',  payload: { email: 'neha@example.com', role: 'student' },    created_at: '2024-03-15T09:30:00Z' },
  { id: 'al-02', user_id: 'u-admin-01', user: { id: 'u-admin-01', full_name: 'Rahul Verma', role: 'admin' }, action: 'course.published',  resource: 'course', resource_id: 'c-05', ip_address: '103.21.44.1',  payload: { title: 'Digital Marketing Mastery' },            created_at: '2024-03-14T16:00:00Z' },
  { id: 'al-03', user_id: 'u-admin-01', user: { id: 'u-admin-01', full_name: 'Rahul Verma', role: 'admin' }, action: 'user.role_changed', resource: 'user',   resource_id: 'u-12', ip_address: '103.21.44.1',  payload: { from: 'student', to: 'instructor' },              created_at: '2024-03-13T11:00:00Z' },
  { id: 'al-04', user_id: 'u-admin-01', user: { id: 'u-admin-01', full_name: 'Rahul Verma', role: 'admin' }, action: 'announcement.sent', resource: 'announcement', resource_id: 'an-01', ip_address: '103.21.44.1', payload: { audience: 'all' },                       created_at: '2024-03-14T11:00:00Z' },
  { id: 'al-05', user_id: 'u-admin-01', user: { id: 'u-admin-01', full_name: 'Rahul Verma', role: 'admin' }, action: 'user.deactivated',  resource: 'user',   resource_id: 'u-13', ip_address: '103.21.44.1',  payload: { reason: 'Policy violation' },                    created_at: '2024-03-12T09:00:00Z' },
]

// ─── ALL USERS (15 — for admin users table) ──────────────────────────────────

export const mockAllUsers: Profile[] = [
  mockUsers.student,
  mockUsers.instructor,
  mockUsers.admin,
  { id: 'u-04', email: 'aarti@example.com',   full_name: 'Aarti Joshi',   avatar_url: null, role: 'student',    bio: null, department: null, is_active: true,  created_at: '2024-01-20T00:00:00Z', updated_at: '2024-02-10T00:00:00Z' },
  { id: 'u-05', email: 'rohan@example.com',   full_name: 'Rohan Gupta',   avatar_url: null, role: 'student',    bio: null, department: null, is_active: true,  created_at: '2024-01-25T00:00:00Z', updated_at: '2024-02-15T00:00:00Z' },
  { id: 'u-06', email: 'kavya@example.com',   full_name: 'Kavya Reddy',   avatar_url: null, role: 'student',    bio: null, department: null, is_active: true,  created_at: '2024-02-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
  { id: 'u-07', email: 'arun@example.com',    full_name: 'Arun Kumar',    avatar_url: null, role: 'instructor', bio: null, department: null, is_active: true,  created_at: '2023-10-01T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
  { id: 'u-08', email: 'deepika@example.com', full_name: 'Deepika Singh', avatar_url: null, role: 'student',    bio: null, department: null, is_active: false, created_at: '2023-12-01T00:00:00Z', updated_at: '2024-02-20T00:00:00Z' },
  { id: 'u-09', email: 'manish@example.com',  full_name: 'Manish Tiwari', avatar_url: null, role: 'student',    bio: null, department: null, is_active: true,  created_at: '2024-02-10T00:00:00Z', updated_at: '2024-02-28T00:00:00Z' },
  { id: 'u-10', email: 'pallavi@example.com', full_name: 'Pallavi Desai', avatar_url: null, role: 'student',    bio: null, department: null, is_active: true,  created_at: '2024-02-15T00:00:00Z', updated_at: '2024-03-05T00:00:00Z' },
  { id: 'u-11', email: 'neha@example.com',    full_name: 'Neha Kulkarni', avatar_url: null, role: 'student',    bio: null, department: null, is_active: true,  created_at: '2024-03-15T09:30:00Z', updated_at: '2024-03-15T09:30:00Z' },
  { id: 'u-12', email: 'raj@example.com',     full_name: 'Raj Bhandari',  avatar_url: null, role: 'instructor', bio: null, department: null, is_active: true,  created_at: '2023-08-15T00:00:00Z', updated_at: '2024-03-13T11:00:00Z' },
  { id: 'u-13', email: 'sneha@example.com',   full_name: 'Sneha Patel',   avatar_url: null, role: 'student',    bio: null, department: null, is_active: false, created_at: '2023-09-01T00:00:00Z', updated_at: '2024-03-12T09:00:00Z' },
  { id: 'u-14', email: 'vikram@example.com',  full_name: 'Vikram Nair',   avatar_url: null, role: 'student',    bio: null, department: null, is_active: true,  created_at: '2023-10-10T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
  { id: 'u-15', email: 'prerna@example.com',  full_name: 'Prerna Chauhan',avatar_url: null, role: 'instructor', bio: null, department: null, is_active: true,  created_at: '2023-11-20T00:00:00Z', updated_at: '2024-02-01T00:00:00Z' },
]
```

---

## 28. `vite.config.ts` — PATH ALIASES

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Also update `tsconfig.json` (merge with existing content, don't replace):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 29. PUBLIC FOOTER — `src/components/navigation/PublicFooter.tsx`

Four-column grid (collapses to 2 on md, 1 on sm):

**Column 1 — Brand**
- EduFlow logo (img `h-8`)
- Tagline: "Learn anything, anywhere."
- Social icons: `<a href="..." target="_blank">` for GitHub, Twitter/X, LinkedIn using Lucide icons

**Column 2 — Platform**
- Courses → `/catalog`
- Pricing → `/#pricing`
- Blog → `/blog` (404 stub)
- Careers → `/careers` (404 stub)

**Column 3 — Support**
- Help Center → `/help` (404 stub)
- Contact Us → `mailto:support@eduflow.app`
- System Status → `https://status.eduflow.app` (external)

**Column 4 — Legal**
- Privacy Policy → `/privacy` (404 stub)
- Terms of Service → `/terms` (404 stub)
- Cookie Policy → `/cookies` (404 stub)

**Bottom bar**:
```typescript
<p>© {new Date().getFullYear()} EduFlow. All rights reserved.</p>
```

---

## 30. THEME INITIALIZATION — `index.html`

Add this script to the `<head>` **before any other scripts** to prevent flash of wrong theme on page load:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EduFlow — Learn Anything, Anywhere</title>

    <!-- Theme init: runs synchronously BEFORE React renders to prevent FOCT -->
    <script>
      (function () {
        try {
          var stored = localStorage.getItem('eduflow-theme');
          var state  = stored ? JSON.parse(stored) : null;
          var theme  = state && state.state ? state.state.theme : 'system';
          var isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (isDark) document.documentElement.classList.add('dark');
        } catch (e) {
          // Silently fail — default light theme
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

> The `try/catch` prevents the entire page from breaking if localStorage is unavailable (e.g., private browsing with strict settings).

---

## 31. ACCEPTANCE CRITERIA

Phase 1 is complete when ALL of the following pass:

### Auth flows
- [ ] `/login` form validates (shows field-level errors), submits to Supabase, redirects to correct role dashboard
- [ ] `/login` Google OAuth button initiates OAuth flow and redirects after success
- [ ] Wrong credentials shows toast: "Invalid email or password"
- [ ] Already-authenticated user visiting `/login` or `/signup` is redirected to their dashboard
- [ ] `/signup` validates all fields including password strength (bar shows) and confirm match
- [ ] Successful signup navigates to `/verify-email` with email in location state
- [ ] `/forgot-password` sends reset email; success state shown regardless of email existence
- [ ] `/forgot-password` resend button has 60s cooldown countdown
- [ ] `/reset-password` shows loading spinner until PASSWORD_RECOVERY event, then shows form
- [ ] `/reset-password` times out after 10s with expired link message if no event fires
- [ ] `/verify-email` shows pending UI; flips to success when SIGNED_IN event fires
- [ ] `/auth/callback` exchanges PKCE code and redirects to correct role dashboard

### Route guards
- [ ] Unauthenticated user visiting `/student/dashboard` → `/login?redirect=%2Fstudent%2Fdashboard`
- [ ] After login, user is redirected to the original intended path
- [ ] Student visiting `/admin/dashboard` → `/403`
- [ ] Student visiting `/instructor/courses` → `/403`
- [ ] Instructor visiting `/admin/dashboard` → `/403`

### Navigation
- [ ] Every sidebar item navigates to its route without error
- [ ] Every topbar item (search enter, bell, avatar dropdown items) works
- [ ] Logo in every layout navigates to the correct role dashboard (or `/` for public)
- [ ] Notification dropdown opens with mock data; [View all] → `/notifications`
- [ ] Profile dropdown [Log out] clears auth state and navigates to `/login`
- [ ] Theme toggle cycles light → dark → system (persisted across refresh)
- [ ] Breadcrumb in topbar reflects current route

### Layouts
- [ ] `StudentLayout` sidebar shows student nav items
- [ ] `InstructorLayout` sidebar shows instructor nav items
- [ ] `AdminLayout` sidebar shows admin nav items
- [ ] At tablet (`md`) breakpoint: sidebar collapses to icon-only (labels hidden, tooltips shown)
- [ ] At mobile (`< md`): sidebar hidden, `MobileBottomNav` shown with correct role items
- [ ] Shared pages (`/messages`, `/profile`, etc.) render the layout matching the user's role
- [ ] All stub pages render inside their correct layout with correct page title
- [ ] `LessonLayout` shows minimal top bar with back link and logo

### Design
- [ ] Sora font applied to all headings (`h1–h6`)
- [ ] DM Sans applied to body text
- [ ] `#6366F1` primary color on active sidebar items and primary buttons
- [ ] Dark mode changes background, surface, and text correctly (no gray/wrong colors)
- [ ] No flash of wrong theme on hard refresh (inline script handles it)
- [ ] No layout shift on page load

### Error pages
- [ ] `/403` shows lock icon, correct message, working [← Go Back] and [Go Home] buttons
- [ ] `/404` shows compass icon, correct message, working [Go Home] button
- [ ] Any unknown route → redirects to `/404`

### Data
- [ ] `mockNotifications` loads into notificationStore on app init (add to `useAuthBootstrap` or call in Topbar)
- [ ] Unread count badge shows on notification bell and notification sidebar item
- [ ] `mockCourses` available for GlobalSearch filtering

---

## 32. KEY IMPLEMENTATION NOTES

1. **Build auth pages first** — the rest of the app depends on having a working session.

2. **Register ALL routes before building any pages** — even if the page file is just a stub. This prevents broken imports during development.

3. **`useAuthBootstrap()` in App.tsx is critical** — it sets `isLoading = true` until the session check resolves. The spinner in App.tsx prevents a flash of the redirect before auth state is known.

4. **Never use `window.location` for navigation** — always use `navigate()` from `useNavigate()` inside React components.

5. **Password show/hide toggle** — the Eye/EyeOff icon must be positioned `absolute right-3 top-1/2 -translate-y-1/2` inside a `relative` wrapper on the input, never adjacent to it.

6. **Google OAuth redirect URI** — in development, `VITE_APP_URL` must be `http://localhost:5173`. The Supabase allowed redirect URLs must include `http://localhost:5173/auth/callback` **exactly** (no trailing slash). In production, add the production URL too.

7. **Role from Supabase** — `session.user` does NOT contain the role. Always fetch from the `profiles` table after login using the user's `id`.

8. **Zustand persist hydration** — on mount, `isAuthenticated` and `user` may be restored from localStorage while `isLoading` is still `true`. Never render auth-dependent UI until `isLoading = false`. The App.tsx spinner handles this gap.

9. **shadcn/ui components** — import them from `@/components/ui/...`, never from `@radix-ui/react-*` directly.

10. **Dark mode** — use Tailwind `dark:` variant classes throughout. The `dark` class on `<html>` is toggled by `themeStore`. Test every component in both modes before marking Phase 1 complete.

11. **Toaster placement** — `<Toaster />` from `sonner` is placed once in `main.tsx`. Never put it inside a layout component.

12. **Responsive sidebar** — use the `useMobile()` and `useTablet()` hooks (from `useMediaQuery.ts`) to control sidebar visibility and width. On mobile, sidebar is `hidden` — `MobileBottomNav` renders instead (fixed bottom).

13. **All links to stub pages** — use real `<Link to="...">` components, never disabled buttons. The stub page renders a placeholder inside the correct layout.

14. **File naming convention**: PascalCase for components/pages (`LoginPage.tsx`), camelCase for hooks/utilities (`useAuth.ts`).

15. **CSS variables must be HSL** — all `--variable: H S% L%` values in `index.css`. Never use RGB or raw hex in CSS variable definitions. Tailwind reads them as `hsl(var(--x))`.

16. **localStorage key namespacing** — three separate keys are used:
    - `'eduflow-auth'` → Zustand authStore
    - `'eduflow-theme'` → Zustand themeStore
    - `'eduflow-supabase-auth'` → Supabase session
    - `'eduflow-search-history'` → GlobalSearch recent queries

17. **Load mock notifications on boot** — in `useAuthBootstrap` (or in a Topbar `useEffect`), seed the notification store: `setNotifications(mockNotifications.filter(n => n.user_id === user?.id))`. This ensures the unread badge appears immediately.

18. **`RoleAwareLayout` does not render `<Outlet />`** — it renders one of the three role-specific layouts which each contain `<Outlet />` internally. Do not add an extra `<Outlet />` inside `RoleAwareLayout`.

19. **TypeScript strict mode** — ensure `tsconfig.json` has `"strict": true`. This prevents subtle null/undefined bugs at compile time rather than runtime.

20. **Favicon** — set the favicon in `index.html` to the logo SVG: `<link rel="icon" type="image/svg+xml" href="/logo.svg" />`.
