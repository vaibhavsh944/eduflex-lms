# PHASE 4 PRD — EduFlow LMS
## Student Extended Features: Profile · Progress Analytics · Messaging · Notifications · Global Search

**Version**: 1.0  
**Depends on**: Phase 1 (auth, layouts, all routes, Supabase profiles + RLS) + Phase 2 (courses, catalog) + Phase 3 (lesson_progress, quiz_attempts, assignment_submissions, user_streaks, enrollments with progress_pct)  
**Goal**: A fully authenticated student has a complete identity (profile with avatar, bio, social links), can view deep analytics on their own learning (charts of score history, time spent, completion heatmaps), can send and receive direct messages with instructors in real time, receives and manages in-app notifications with a live badge count, and can search the entire platform with a cmd+K palette. Every interaction is real Supabase data. Zero stubs remain in Phase 4's scope.

---

## 1. OVERVIEW

Phase 4 transforms EduFlow from a learning engine into a complete platform with identity, communication, and discoverability. It wires up the notification bell, messages icon, and search bar that Phase 1 scaffolded in the `Topbar` — converting them from dead UI into fully working features backed by Supabase Realtime subscriptions.

### Pages built (replacing Phase 1 stubs):

| Route | Page | Layout |
|-------|------|--------|
| `/profile` | Profile — Account & Settings | `StudentLayout` (role-aware) |
| `/profile/edit` | Profile — Edit Info | `StudentLayout` (role-aware) |
| `/profile/progress` | My Learning Progress | `StudentLayout` |
| `/profile/payments` | Payment History (stub shell) | `StudentLayout` |
| `/messages` | Direct Messages | `StudentLayout` (role-aware) |
| `/messages/:threadId` | Message Thread | `StudentLayout` (role-aware) |
| `/notifications` | Notification Centre | `StudentLayout` (role-aware) |

### Global UI wired up (in-topbar, not a page):
- `NotificationBell` — live badge count via Realtime, dropdown preview of last 5, links to `/notifications`
- `GlobalSearchModal` — cmd+K modal, real-time search across courses + lessons + users

### What "done" looks like:
A student opens their profile → uploads a new avatar (stored in Supabase `avatars` bucket, signed URL saved to `profiles.avatar_url`) → edits their bio and social links → views their Progress page with a Recharts line chart of quiz scores over time, a bar chart of weekly study hours, and a 365-day activity heatmap → navigates to Messages → finds their instructor thread → types a message that appears on both sides instantly via Supabase Realtime → receives a notification bell badge that ticks up when the instructor replies → opens the notifications page and marks all as read → presses cmd+K and searches for "React hooks" → sees matching courses and lessons — clicks one and lands on that lesson in the course player.

---

## 2. DELIVERABLES CHECKLIST

### Database
- [ ] `profiles` table: `ALTER TABLE` to add `headline`, `website`, `twitter_handle`, `linkedin_url`, `github_username`, `notification_preferences` columns
- [ ] `message_threads` table created with RLS
- [ ] `messages` table created with RLS
- [ ] `notifications` table created with RLS
- [ ] Supabase Realtime enabled on `messages` table (for channel subscription)
- [ ] Supabase Realtime enabled on `notifications` table (for bell badge)
- [ ] Supabase Storage bucket `avatars` created (public bucket with RLS on write)
- [ ] Edge Function `send-notification` deployed
- [ ] DB trigger: `on INSERT messages` → call `send-notification` for the recipient
- [ ] Seed data: 2 message threads, 6 messages per thread, 10 notifications per seeded user

### New Dependencies
- [ ] `recharts` already in stack — confirm installed (add if not)
- [ ] `date-fns` already installed — confirm
- [ ] `cmdk` installed (cmd+K command palette library)
- [ ] `react-intersection-observer` installed (infinite scroll in messages)

### Zustand Stores
- [ ] `notificationStore` — extended (was a stub in Phase 1; now fully implemented)
- [ ] `messageStore` — active thread ID, unread counts per thread, online status map

### TanStack Query Hooks
- [ ] `useCurrentProfile` — own profile full data (already partial in Phase 1 `useProfile.ts` — replace/extend)
- [ ] `useUpdateProfile` — mutation: UPDATE profiles text fields
- [ ] `useUploadAvatar` — mutation: upload to Storage + UPDATE profiles.avatar_url
- [ ] `useChangePassword` — mutation: calls `supabase.auth.updateUser({ password })`
- [ ] `useProgressAnalytics` — aggregated analytics from lesson_progress + quiz_attempts + enrollments
- [ ] `useWeeklyActivity` — grouped lesson completions by week for bar chart
- [ ] `useQuizScoreHistory` — all quiz_attempts for the user, ordered by date (for line chart)
- [ ] `useActivityHeatmap` — 365-day lesson completion dates for heatmap (from `user_streaks.activity_dates` + `lesson_progress.completed_at`)
- [ ] `useMessageThreads` — all threads for current user with last message + unread count
- [ ] `useThread` — all messages in a single thread (paginated, 30 per page)
- [ ] `useSendMessage` — mutation: INSERT message + update thread timestamp
- [ ] `useMarkThreadRead` — mutation: update `message_threads.{user_a_read_at | user_b_read_at}`
- [ ] `useStartThread` — mutation: find-or-create thread between two users
- [ ] `useNotifications` — paginated list, sorted desc
- [ ] `useUnreadNotificationCount` — COUNT where `read_at IS NULL` for badge
- [ ] `useMarkNotificationRead` — mutation: UPDATE notifications SET read_at = NOW()
- [ ] `useMarkAllNotificationsRead` — mutation: bulk UPDATE
- [ ] `useSearch` — debounced full-text search across courses + lessons + profiles

### Realtime Subscriptions
- [ ] `useMessageRealtime(threadId)` — subscribes to `messages` filtered by `thread_id`; appends new messages to TanStack Query cache
- [ ] `useNotificationRealtime()` — subscribes to `notifications` filtered by `user_id`; increments unread count in `notificationStore`

### Pages
- [ ] `ProfilePage.tsx` — display-only profile view
- [ ] `ProfileEditPage.tsx` — editable form for all profile fields + avatar
- [ ] `ProgressPage.tsx` — analytics dashboard with 5 chart/widget sections
- [ ] `MessagesPage.tsx` — split-panel layout: thread list (left) + message view (right)
- [ ] `NotificationsPage.tsx` — paginated notification list with bulk actions

### Components (new)
- [ ] `AvatarUploader.tsx`
- [ ] `ProfileForm.tsx`
- [ ] `PasswordChangeForm.tsx`
- [ ] `NotificationPreferencesForm.tsx`
- [ ] `SocialLinksForm.tsx`
- [ ] `ProfileCard.tsx` (display, used on profile view + hover cards elsewhere)
- [ ] `ScoreHistoryChart.tsx` (Recharts LineChart)
- [ ] `WeeklyActivityChart.tsx` (Recharts BarChart)
- [ ] `CourseCompletionCard.tsx` (per-course progress display)
- [ ] `ActivityHeatmap.tsx` (365-day grid, GitHub-style)
- [ ] `SkillBreakdownChart.tsx` (Recharts RadarChart)
- [ ] `StatSummaryRow.tsx` (horizontal 4-stat strip for progress page)
- [ ] `ThreadList.tsx`
- [ ] `ThreadListItem.tsx`
- [ ] `MessageBubble.tsx`
- [ ] `MessageComposer.tsx`
- [ ] `MessageThread.tsx` (the right-panel, renders messages + composer)
- [ ] `MessageSearchBar.tsx` (filter threads by name)
- [ ] `NewMessageModal.tsx` (start new conversation — select instructor)
- [ ] `OnlinePresenceDot.tsx`
- [ ] `NotificationItem.tsx`
- [ ] `NotificationBell.tsx` (topbar icon + dropdown — replaces Phase 1 stub)
- [ ] `GlobalSearchModal.tsx` (cmd+K — replaces Phase 1 stub)
- [ ] `SearchResultGroup.tsx`
- [ ] `SearchResultItem.tsx`
- [ ] `EmptyThreadState.tsx`
- [ ] `EmptyNotificationsState.tsx`

### Global UI Wired (Topbar updates)
- [ ] `Topbar.tsx` — wire `NotificationBell` with real unread count from `notificationStore`
- [ ] `Topbar.tsx` — wire `GlobalSearchModal` open on cmd+K keyboard shortcut
- [ ] `Topbar.tsx` — wire Messages icon with unread thread count badge

### Acceptance
- [ ] All acceptance criteria in Section 15 pass

---

## 3. USER STORIES

### Student — Profile

| Story | Acceptance Criterion |
|-------|---------------------|
| I want to see my public profile as others would see it | `/profile` renders display view with avatar, name, headline, bio, social links |
| I want to update my name, bio, and social links | `/profile/edit` form saves correctly; changes visible immediately on `/profile` |
| I want to upload a new profile photo | Drag-and-drop or click-to-select in `AvatarUploader`; preview shown before save; uploading to Supabase Storage and URL saved to `profiles.avatar_url` |
| I want to change my password | Password change form validates current password (client-side flow via re-auth) and minimum 8 chars |
| I want to choose which email notifications I receive | Notification preferences toggles save to `profiles.notification_preferences` JSONB column |

### Student — Progress Analytics

| Story | Acceptance Criterion |
|-------|---------------------|
| I want to see all my quiz scores over time | Line chart shows each quiz attempt's score (%) with the quiz name on hover tooltip |
| I want to see how many hours I've studied each week | Bar chart shows total completed lesson `duration_minutes` per calendar week |
| I want to see a GitHub-style activity heatmap | 365-day grid shows activity intensity (0–5+ lessons per day) with color gradient |
| I want to see my completion rate per enrolled course | Horizontal bar strip per course shows completed/total lessons |
| I want to see my skill strengths by category | Radar chart shows avg quiz score grouped by course category |

### Student — Messages

| Story | Acceptance Criterion |
|-------|---------------------|
| I want to message my instructor directly | `[Message Instructor]` button on course player and profile starts or opens a thread |
| I want to see all my message threads in one place | Thread list on left panel sorted by most recent message descending |
| I want to see unread message counts | Unread thread count badge on Messages icon in topbar; bold thread title + dot for unread threads |
| I want messages to appear instantly | Supabase Realtime subscription appends new messages without a page refresh |
| I want to see if my message was read | Read receipts: message shows "Seen" when the other user's `read_at` timestamp is after `sent_at` |
| I want to search through my threads | Thread list has a search bar filtering by contact name |
| I want to start a new conversation with an instructor | `[New Message]` modal shows list of instructors for enrolled courses |

### Student — Notifications

| Story | Acceptance Criterion |
|-------|---------------------|
| I want to see a badge when I have new notifications | Bell icon shows red badge with count; updates in real time via Supabase Realtime |
| I want a quick preview of latest notifications | Bell dropdown shows last 5 notifications with type icons |
| I want to see all notifications on one page | `/notifications` shows full paginated list sorted desc |
| I want to mark individual notifications as read | Clicking a notification marks it read and navigates to the relevant resource |
| I want to mark all notifications as read at once | `[Mark all as read]` button in header of notifications page |
| I want notifications for: new messages, quiz pass, assignment graded, announcement | Each notification type has an icon and body text |

### Student — Global Search

| Story | Acceptance Criterion |
|-------|---------------------|
| I want to search from anywhere in the app without leaving the page | cmd+K (Mac) or Ctrl+K (Windows) opens `GlobalSearchModal` from any route |
| I want search results to update as I type | Results update with 300ms debounce — no submit button needed |
| I want results grouped by type | Results grouped: "Courses", "Lessons", "People" — each group has a heading |
| I want to navigate to a result with keyboard | Arrow keys navigate results; Enter opens the selection |
| I want recent searches saved locally | Last 5 searches stored in `localStorage` and shown when search input is empty |

---

## 4. NEW DEPENDENCIES

Install before writing any code:

```bash
npm install cmdk react-intersection-observer

# Confirm these are already installed (from Phase 1/2); install if missing:
npm install recharts date-fns
```

> **`cmdk`**: The industry-standard command palette library. Zero styling out of the box — we style it to match the EduFlow design system. Exports `Command`, `Command.Input`, `Command.List`, `Command.Group`, `Command.Item`, `Command.Empty`. Wraps in a `Dialog` for accessibility (focus trap, esc to close).
>
> **`react-intersection-observer`**: Provides `useInView` hook. Used for infinite scroll in the message thread (load older messages when scrolling to top) and for lazy-loading the heatmap chart.
>
> **`recharts`**: Already in the tech stack. If not installed: `npm install recharts`. Used for 4 chart types on the Progress page: `LineChart`, `BarChart`, `RadarChart`, and a custom `HeatmapCell` implementation.

---

## 5. DATABASE SCHEMA — SUPABASE SQL

Run all blocks in order in the Supabase SQL Editor.

---

### 5.1 Extend `profiles` Table

The `profiles` table was created in Phase 1. Add the columns needed for Phase 4:

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline              TEXT,
  ADD COLUMN IF NOT EXISTS website              TEXT,
  ADD COLUMN IF NOT EXISTS twitter_handle       TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url         TEXT,
  ADD COLUMN IF NOT EXISTS github_username      TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
    "email_new_message": true,
    "email_assignment_graded": true,
    "email_quiz_results": false,
    "email_announcements": true,
    "email_deadline_reminders": true,
    "inapp_new_message": true,
    "inapp_assignment_graded": true,
    "inapp_quiz_results": true,
    "inapp_announcements": true,
    "inapp_deadline_reminders": true
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS last_seen_at         TIMESTAMPTZ;
```

> `headline` — a short tagline displayed under the name ("Full-Stack Developer · Learning React"). Max 100 chars.
>
> `last_seen_at` — updated on every login and every 5 minutes of activity via a client-side heartbeat. Used to show the online presence dot in messaging.
>
> `notification_preferences` — JSONB rather than individual boolean columns for flexibility. Adding new notification types in future phases requires no schema migration.

---

### 5.2 `message_threads` Table

```sql
CREATE TABLE public.message_threads (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_preview TEXT,
  -- Read tracking: when each user last read this thread
  user_a_read_at  TIMESTAMPTZ,
  user_b_read_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicate threads between the same two users
  UNIQUE (LEAST(user_a_id::text, user_b_id::text), GREATEST(user_a_id::text, user_b_id::text)),
  -- Prevent self-messaging
  CHECK (user_a_id <> user_b_id)
);

-- Index for fast lookup of all threads a user participates in
CREATE INDEX idx_message_threads_user_a ON public.message_threads(user_a_id);
CREATE INDEX idx_message_threads_user_b ON public.message_threads(user_b_id);
CREATE INDEX idx_message_threads_last_msg ON public.message_threads(last_message_at DESC);

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Users can see threads they are part of
CREATE POLICY "Users can view own threads"
  ON public.message_threads FOR SELECT
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- Users can create threads (as either participant)
CREATE POLICY "Users can create threads"
  ON public.message_threads FOR INSERT
  WITH CHECK (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- Users can update read timestamps on their own threads
CREATE POLICY "Users can update own threads"
  ON public.message_threads FOR UPDATE
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid());
```

> **Why the UNIQUE constraint uses LEAST/GREATEST**: To prevent two threads between the same pair in either order (A↔B and B↔A), we normalize the pair by sorting IDs lexicographically. `LEAST('uuid-a', 'uuid-b')` always returns the smaller string, regardless of who initiates.
>
> **Why UNIQUE on text-cast UUIDs**: The `LEAST`/`GREATEST` functions in PostgreSQL require identical types. Casting to `::text` ensures consistent comparison even if UUID collation differs. The uniqueness is enforced at the DB level, removing the need for client-side find-or-create races.

---

### 5.3 `messages` Table

```sql
CREATE TABLE public.messages (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id   UUID        NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body        TEXT        NOT NULL CHECK (length(trim(body)) > 0),
  -- Attachment support (Phase 4: text only; future phases may add file_url)
  file_url    TEXT,
  file_name   TEXT,
  is_deleted  BOOLEAN     NOT NULL DEFAULT false,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast pagination within a thread
CREATE INDEX idx_messages_thread_sent ON public.messages(thread_id, sent_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages in threads they are part of
CREATE POLICY "Thread participants can read messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads
      WHERE id = messages.thread_id
        AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
    )
  );

-- Users can only send messages as themselves
CREATE POLICY "Users can insert own messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.message_threads
      WHERE id = messages.thread_id
        AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
    )
  );

-- Users can soft-delete their own messages (set is_deleted = true)
CREATE POLICY "Users can soft-delete own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() AND is_deleted = true);
```

---

### 5.4 `messages` Realtime + Thread Update Trigger

```sql
-- Enable Realtime on messages table (run in SQL editor; also configure in Supabase Dashboard → Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: when a new message is inserted, update the thread's last_message_at and preview
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.message_threads
  SET
    last_message_at = NEW.sent_at,
    last_message_preview = LEFT(NEW.body, 60)
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();
```

---

### 5.5 `notifications` Table

```sql
CREATE TABLE public.notifications (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL
              CHECK (type IN (
                'new_message',
                'quiz_passed',
                'quiz_failed',
                'assignment_graded',
                'assignment_returned',
                'course_announcement',
                'new_enrollment',
                'deadline_reminder',
                'course_complete',
                'reply_to_post'
              )),
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  -- Deep link: where to navigate when notification is clicked
  action_url  TEXT,
  -- Optional: context IDs for filtering
  course_id   UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- who triggered it
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast unread count per user
CREATE INDEX idx_notifications_user_unread
  ON public.notifications(user_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Service role (Edge Functions) can insert notifications for any user
-- (covered by service_role key bypassing RLS — no policy needed)
```

---

### 5.6 Supabase Storage Bucket — `avatars`

```sql
-- Create the avatars storage bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,   -- Public read: avatar URLs are embeddable in img tags without signed URLs
  2097152, -- 2MB limit for avatars
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated users can upload to their own folder
CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
  );

-- Policy: authenticated users can update (replace) their own avatar
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: anyone can read avatars (public bucket, belt-and-suspenders policy)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

> **Avatar file path pattern**: `avatars/{user_id}/{timestamp}.{ext}` — e.g., `avatars/abc-123/1716400000000.webp`
>
> **Why public bucket**: Avatar images are profile photos. They're meant to be seen by anyone viewing a course, a forum thread, or a message thread. Using a public bucket means `supabase.storage.from('avatars').getPublicUrl(path)` returns a stable permanent URL with no expiry — perfect for caching in `img` tags and `<Avatar>` components throughout the app.
>
> **2MB limit**: Enforced at the bucket level AND client-side in `AvatarUploader`. Warn the user if their file exceeds this before attempting upload.

---

### 5.7 Seed Data

```sql
DO $$
DECLARE
  student_id   UUID;
  instructor_id UUID;
  thread_id    UUID;
  m1_id        UUID;
  m2_id        UUID;
BEGIN
  -- Get a student and instructor from existing profiles
  SELECT id INTO student_id FROM public.profiles WHERE role = 'student' LIMIT 1;
  SELECT id INTO instructor_id FROM public.profiles WHERE role = 'instructor' LIMIT 1;

  IF student_id IS NOT NULL AND instructor_id IS NOT NULL THEN
    -- Create a message thread
    INSERT INTO public.message_threads (user_a_id, user_b_id, last_message_at, last_message_preview)
    VALUES (student_id, instructor_id, NOW() - INTERVAL '5 minutes', 'Thanks for the clarification!')
    RETURNING id INTO thread_id;

    -- Seed messages
    INSERT INTO public.messages (thread_id, sender_id, body, sent_at)
    VALUES
      (thread_id, student_id, 'Hi! I had a question about the useEffect dependency array in Lesson 4.', NOW() - INTERVAL '2 hours'),
      (thread_id, instructor_id, 'Sure! The dependency array tells React when to re-run the effect. If you pass [], it runs only once after mount.', NOW() - INTERVAL '1 hour 50 minutes'),
      (thread_id, student_id, 'What happens if I omit the array entirely?', NOW() - INTERVAL '1 hour 40 minutes'),
      (thread_id, instructor_id, 'Then the effect runs after every single render. Usually not what you want — it can cause infinite loops if the effect itself updates state.', NOW() - INTERVAL '1 hour 30 minutes'),
      (thread_id, student_id, 'Ah that makes sense! So I should always include the array?', NOW() - INTERVAL '30 minutes'),
      (thread_id, instructor_id, 'Almost always. The React team recommends using the eslint-plugin-react-hooks to catch missing deps automatically.', NOW() - INTERVAL '20 minutes'),
      (thread_id, student_id, 'Thanks for the clarification!', NOW() - INTERVAL '5 minutes');

    -- Update read status (instructor has read everything, student has read everything too)
    UPDATE public.message_threads
    SET user_a_read_at = NOW(), user_b_read_at = NOW()
    WHERE id = thread_id;

    -- Seed notifications for the student
    INSERT INTO public.notifications (user_id, type, title, body, action_url, actor_id, read_at)
    VALUES
      (student_id, 'new_message', 'New message from your instructor',
       'You have a reply from your instructor about useEffect dependencies.',
       '/messages', instructor_id, NOW() - INTERVAL '19 minutes'),
      (student_id, 'quiz_passed', 'Quiz passed! 🎉',
       'You scored 85% on "React Fundamentals Quiz" — well done!',
       NULL, NULL, NOW() - INTERVAL '3 hours'),
      (student_id, 'assignment_graded', 'Assignment graded',
       'Your "Build a React Component" submission has been reviewed. Score: 88/100.',
       NULL, instructor_id, NOW() - INTERVAL '1 day'),
      (student_id, 'deadline_reminder', 'Assignment due tomorrow',
       '"Build a React Component" is due in 24 hours. Submit before the deadline!',
       NULL, NULL, NULL),  -- unread
      (student_id, 'course_announcement', 'New announcement from your instructor',
       'Office hours this Friday at 3 PM IST — bring your questions!',
       NULL, instructor_id, NULL),  -- unread
      (student_id, 'quiz_failed', 'Quiz not passed',
       'You scored 45% on "Advanced React Patterns". Minimum is 70%. You can retake it.',
       NULL, NULL, NOW() - INTERVAL '5 hours'),
      (student_id, 'new_message', 'New message from your instructor',
       'Great progress this week! Keep it up.',
       '/messages', instructor_id, NOW() - INTERVAL '2 days'),
      (student_id, 'deadline_reminder', 'Assignment due in 3 days',
       '"TypeScript Fundamentals" assignment is due in 3 days.',
       NULL, NULL, NULL),  -- unread
      (student_id, 'quiz_passed', 'Quiz passed! 🎉',
       'You scored 92% on "JavaScript Closures Quiz". Outstanding!',
       NULL, NULL, NOW() - INTERVAL '2 days'),
      (student_id, 'course_complete', 'Course complete! 🏆',
       'Congratulations! You have completed "JavaScript Fundamentals".',
       NULL, NULL, NOW() - INTERVAL '1 week');
  END IF;
END $$;
```

---

## 6. EDGE FUNCTION — `send-notification`

Create file: `supabase/functions/send-notification/index.ts`

This function is called by other Edge Functions (e.g., `grade-quiz`, `update-streak`) and by the DB trigger on new messages to create in-app notification rows.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export interface NotificationPayload {
  user_id: string
  type: string
  title: string
  body: string
  action_url?: string
  course_id?: string
  actor_id?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Service role: can insert notifications for any user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload: NotificationPayload = await req.json()

    // Validate required fields
    if (!payload.user_id || !payload.type || !payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check the user's notification preferences before inserting
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', payload.user_id)
      .single()

    const prefs = profile?.notification_preferences ?? {}
    const prefKey = `inapp_${payload.type}` as keyof typeof prefs

    // If user has explicitly disabled this notification type, skip
    if (prefs[prefKey] === false) {
      return new Response(JSON.stringify({ skipped: true, reason: 'User preference' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        action_url: payload.action_url ?? null,
        course_id: payload.course_id ?? null,
        actor_id: payload.actor_id ?? null,
      })
      .select('id')
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

Deploy: `supabase functions deploy send-notification`

**Update `grade-quiz` Edge Function** (from Phase 3) to call `send-notification` after grading:

```typescript
// Add this AFTER the quiz_attempts update in grade-quiz/index.ts

// Notify student of quiz result
const notifType = scorePct >= 70 ? 'quiz_passed' : 'quiz_failed'
const notifTitle = scorePct >= 70 ? 'Quiz passed! 🎉' : 'Quiz not passed'
const notifBody = scorePct >= 70
  ? `You scored ${Math.round(scorePct)}% — well done!`
  : `You scored ${Math.round(scorePct)}%. Minimum is 70%. ${attempt.max_attempts > 1 ? 'You can retake it.' : ''}`

await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
  },
  body: JSON.stringify({
    user_id: user.id,
    type: notifType,
    title: notifTitle,
    body: notifBody,
    course_id: attempt.course_id
  })
})
```

**Add a DB trigger** to call `send-notification` on new messages (note: DB triggers cannot call Edge Functions directly; use a PostgreSQL `pg_net` extension or call from the client-side `useSendMessage` mutation instead):

> **Implementation note**: PostgreSQL triggers cannot call Edge Functions directly. Instead, the `useSendMessage` mutation on the client calls `send-notification` via `supabase.functions.invoke()` after inserting the message. This keeps the notification creation in the app layer where the user context is available. See Section 9.5.

---

## 7. TYPESCRIPT TYPES — ADDITIONS TO `src/lib/types.ts`

Append these to the existing types file. Do not remove Phase 1/2/3 types:

```typescript
// ── Profile (Extended) ───────────────────────────────────────────
// Extends the base Profile type from Phase 1
export interface ProfileExtended {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: 'student' | 'instructor' | 'admin'
  bio: string | null
  department: string | null
  headline: string | null
  website: string | null
  twitter_handle: string | null
  linkedin_url: string | null
  github_username: string | null
  notification_preferences: NotificationPreferences
  last_seen_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  email_new_message: boolean
  email_assignment_graded: boolean
  email_quiz_results: boolean
  email_announcements: boolean
  email_deadline_reminders: boolean
  inapp_new_message: boolean
  inapp_assignment_graded: boolean
  inapp_quiz_results: boolean
  inapp_announcements: boolean
  inapp_deadline_reminders: boolean
}

// ── Messages ─────────────────────────────────────────────────────
export interface MessageThread {
  id: string
  user_a_id: string
  user_b_id: string
  last_message_at: string
  last_message_preview: string | null
  user_a_read_at: string | null
  user_b_read_at: string | null
  created_at: string
  // Joined data: the "other" participant (not the current user)
  other_user: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
    last_seen_at: string | null
  }
  // Derived: true if current user has unread messages in this thread
  has_unread: boolean
}

export interface Message {
  id: string
  thread_id: string
  sender_id: string
  body: string
  file_url: string | null
  file_name: string | null
  is_deleted: boolean
  sent_at: string
  // Joined: sender profile
  sender: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

// ── Notifications ────────────────────────────────────────────────
export type NotificationType =
  | 'new_message'
  | 'quiz_passed'
  | 'quiz_failed'
  | 'assignment_graded'
  | 'assignment_returned'
  | 'course_announcement'
  | 'new_enrollment'
  | 'deadline_reminder'
  | 'course_complete'
  | 'reply_to_post'

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  action_url: string | null
  course_id: string | null
  actor_id: string | null
  read_at: string | null
  created_at: string
  // Optional joined actor
  actor?: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

// ── Progress Analytics ───────────────────────────────────────────
export interface QuizScorePoint {
  date: string                 // ISO date of attempt
  score: number                // 0–100
  passed: boolean
  lesson_title: string
  course_title: string
}

export interface WeeklyActivityPoint {
  week_label: string           // e.g. "May 12"
  minutes_studied: number      // sum of completed lesson durations
  lessons_completed: number
}

export interface ActivityDay {
  date: string                 // YYYY-MM-DD
  count: number                // number of lessons completed that day (0–n)
}

export interface CourseProgressSummary {
  course_id: string
  course_title: string
  thumbnail_url: string | null
  total_lessons: number
  completed_lessons: number
  avg_quiz_score: number | null  // null if no quizzes taken
  time_spent_minutes: number
  enrolled_at: string
  completed_at: string | null
}

export interface SkillRadarPoint {
  category: string             // e.g. "Programming", "Design"
  avg_score: number            // 0–100 average of quiz scores in this category
  fullMark: number             // always 100 (for Recharts RadarChart)
}

export interface ProgressAnalytics {
  stats: {
    total_lessons_completed: number
    total_time_hours: number          // total time in completed lessons
    total_quizzes_taken: number
    avg_quiz_score: number
    courses_completed: number
    current_streak: number
    longest_streak: number
  }
  quizScoreHistory: QuizScorePoint[]
  weeklyActivity: WeeklyActivityPoint[]
  activityDays: ActivityDay[]         // last 365 days
  courseProgress: CourseProgressSummary[]
  skillRadar: SkillRadarPoint[]
}

// ── Global Search ────────────────────────────────────────────────
export interface SearchResult {
  type: 'course' | 'lesson' | 'user'
  id: string
  title: string
  subtitle: string   // e.g. course name for lessons, role for users
  url: string        // navigation target on click
  thumbnail_url: string | null
}

export interface SearchResults {
  courses: SearchResult[]
  lessons: SearchResult[]
  users: SearchResult[]
  total: number
}
```

---

## 8. ZUSTAND STORES

### 8.1 `notificationStore` — `src/store/notificationStore.ts`

This replaces the Phase 1 stub. It now holds real state and is populated by the Realtime subscription:

```typescript
import { create } from 'zustand'
import { AppNotification } from '@/lib/types'

interface NotificationState {
  // Unread count for the bell badge — source of truth is Supabase,
  // but we cache it here to avoid a refetch on every render
  unreadCount: number
  // Latest 5 notifications for the dropdown preview
  previewNotifications: AppNotification[]
  // Actions
  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  decrementUnread: (by?: number) => void
  setPreviewNotifications: (notifications: AppNotification[]) => void
  prependNotification: (notification: AppNotification) => void
  markPreviewRead: (id: string) => void
  markAllPreviewRead: () => void
  reset: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  previewNotifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrementUnread: (by = 1) => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),
  setPreviewNotifications: (notifications) => set({ previewNotifications: notifications }),
  prependNotification: (notification) =>
    set((s) => ({
      unreadCount: s.unreadCount + 1,
      previewNotifications: [notification, ...s.previewNotifications].slice(0, 5),
    })),
  markPreviewRead: (id) =>
    set((s) => ({
      previewNotifications: s.previewNotifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
    })),
  markAllPreviewRead: () =>
    set((s) => ({
      unreadCount: 0,
      previewNotifications: s.previewNotifications.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
    })),
  reset: () => set({ unreadCount: 0, previewNotifications: [] }),
}))
```

---

### 8.2 `messageStore` — `src/store/messageStore.ts`

```typescript
import { create } from 'zustand'

interface MessageState {
  // Currently open thread
  activeThreadId: string | null
  // Unread count per thread: { threadId: count }
  unreadPerThread: Record<string, number>
  // Total unread count (sum of all threads) for the topbar badge
  totalUnread: number
  // Online status: { userId: boolean }
  onlineStatus: Record<string, boolean>
  // Actions
  setActiveThread: (threadId: string | null) => void
  setUnreadForThread: (threadId: string, count: number) => void
  clearUnreadForThread: (threadId: string) => void
  setOnlineStatus: (userId: string, isOnline: boolean) => void
  reset: () => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  activeThreadId: null,
  unreadPerThread: {},
  totalUnread: 0,
  onlineStatus: {},
  setActiveThread: (threadId) => set({ activeThreadId: threadId }),
  setUnreadForThread: (threadId, count) =>
    set((s) => {
      const updated = { ...s.unreadPerThread, [threadId]: count }
      const total = Object.values(updated).reduce((acc, n) => acc + n, 0)
      return { unreadPerThread: updated, totalUnread: total }
    }),
  clearUnreadForThread: (threadId) =>
    set((s) => {
      const updated = { ...s.unreadPerThread, [threadId]: 0 }
      const total = Object.values(updated).reduce((acc, n) => acc + n, 0)
      return { unreadPerThread: updated, totalUnread: total }
    }),
  setOnlineStatus: (userId, isOnline) =>
    set((s) => ({ onlineStatus: { ...s.onlineStatus, [userId]: isOnline } })),
  reset: () => set({ activeThreadId: null, unreadPerThread: {}, totalUnread: 0, onlineStatus: {} }),
}))
```

---

## 9. TANSTACK QUERY HOOKS

### 9.1 `useCurrentProfile` — `src/hooks/queries/useCurrentProfile.ts`

Replaces/extends the Phase 1 `useProfile.ts`. Returns the full `ProfileExtended` type:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ProfileExtended } from '@/lib/types'
import { toast } from 'sonner'

export function useCurrentProfile() {
  const user = useAuthStore((s) => s.user)

  return useQuery<ProfileExtended>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data as ProfileExtended
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,  // 5 minutes — profile changes rarely
  })
}
```

---

### 9.2 `useUpdateProfile` — `src/hooks/mutations/useUpdateProfile.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

interface UpdateProfilePayload {
  full_name?: string
  headline?: string
  bio?: string
  website?: string
  twitter_handle?: string
  linkedin_url?: string
  github_username?: string
  notification_preferences?: Record<string, boolean>
}

export function useUpdateProfile() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Profile updated successfully.')
      qc.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.')
    }
  })
}
```

---

### 9.3 `useUploadAvatar` — `src/hooks/mutations/useUploadAvatar.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export function useUploadAvatar() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated')

      // Validate: max 2MB, image types only
      if (file.size > 2 * 1024 * 1024) throw new Error('File must be under 2MB')
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        throw new Error('File must be JPEG, PNG, WebP, or GIF')
      }

      // Delete old avatar first (best-effort — ignore failure)
      // Pattern: list files in user folder and remove them
      const { data: existing } = await supabase.storage
        .from('avatars')
        .list(user.id)
      if (existing && existing.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove(existing.map((f) => `${user.id}/${f.name}`))
      }

      // Upload new avatar
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Save URL to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      if (updateError) throw updateError

      return publicUrl
    },
    onSuccess: () => {
      toast.success('Profile photo updated.')
      qc.invalidateQueries({ queryKey: ['profile', user?.id] })
      // Also update the authStore user object so Topbar avatar refreshes immediately
      // (authStore.user is a shallow copy — invalidating the query is sufficient
      // since Topbar uses useCurrentProfile, not authStore.user.avatar_url directly)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload photo. Please try again.')
    }
  })
}
```

---

### 9.4 `useProgressAnalytics` — `src/hooks/queries/useProgressAnalytics.ts`

This is a multi-query aggregation hook. It fans out 5 queries in parallel and combines them:

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ProgressAnalytics, WeeklyActivityPoint, QuizScorePoint, ActivityDay, CourseProgressSummary, SkillRadarPoint } from '@/lib/types'
import { format, startOfWeek, subDays, eachWeekOfInterval } from 'date-fns'

async function fetchProgressAnalytics(userId: string): Promise<ProgressAnalytics> {
  // All 5 queries in parallel
  const [
    enrollmentsRes,
    lessonProgressRes,
    quizAttemptsRes,
    streakRes,
    coursesRes
  ] = await Promise.all([
    // Enrollments with course data
    supabase
      .from('enrollments')
      .select(`
        id, enrolled_at, progress_pct, completed_at, last_lesson_id,
        course:courses(id, title, thumbnail_url, category, lesson_count, duration_minutes)
      `)
      .eq('user_id', userId),

    // All completed lesson progress records
    supabase
      .from('lesson_progress')
      .select('lesson_id, completed_at, course_id, lesson:lessons(duration_minutes)')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('completed_at', { ascending: true }),

    // All quiz attempts (submitted)
    supabase
      .from('quiz_attempts')
      .select(`
        id, score, passed, submitted_at, course_id,
        lesson:lessons(title),
        course:courses(title, category)
      `)
      .eq('user_id', userId)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true }),

    // Streak data
    supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, activity_dates')
      .eq('user_id', userId)
      .maybeSingle(),

    // Courses (for per-lesson duration data)
    supabase
      .from('courses')
      .select('id, category')
  ])

  const enrollments = enrollmentsRes.data ?? []
  const lessonProgress = lessonProgressRes.data ?? []
  const quizAttempts = quizAttemptsRes.data ?? []
  const streak = streakRes.data
  const courses = coursesRes.data ?? []

  // ── Stats ─────────────────────────────────────────────────────
  const totalTimeMinutes = lessonProgress.reduce((acc, lp) => {
    return acc + ((lp.lesson as { duration_minutes: number } | null)?.duration_minutes ?? 0)
  }, 0)

  const scoredAttempts = quizAttempts.filter((a) => a.score !== null)
  const avgScore = scoredAttempts.length > 0
    ? scoredAttempts.reduce((acc, a) => acc + (a.score ?? 0), 0) / scoredAttempts.length
    : 0

  // ── Quiz Score History ─────────────────────────────────────────
  const quizScoreHistory: QuizScorePoint[] = quizAttempts
    .filter((a) => a.submitted_at && a.score !== null)
    .map((a) => ({
      date: a.submitted_at!.slice(0, 10),
      score: Math.round(a.score!),
      passed: a.passed ?? false,
      lesson_title: (a.lesson as { title: string } | null)?.title ?? 'Unknown Quiz',
      course_title: (a.course as { title: string } | null)?.title ?? ''
    }))

  // ── Weekly Activity ────────────────────────────────────────────
  // Build last 12 weeks of study time
  const twelveWeeksAgo = subDays(new Date(), 84)
  const weeks = eachWeekOfInterval({ start: twelveWeeksAgo, end: new Date() }, { weekStartsOn: 1 })

  const weeklyActivity: WeeklyActivityPoint[] = weeks.map((weekStart) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const lessonsThisWeek = lessonProgress.filter((lp) => {
      if (!lp.completed_at) return false
      const d = new Date(lp.completed_at)
      return d >= weekStart && d < weekEnd
    })

    const minutes = lessonsThisWeek.reduce(
      (acc, lp) => acc + ((lp.lesson as { duration_minutes: number } | null)?.duration_minutes ?? 0),
      0
    )

    return {
      week_label: format(weekStart, 'MMM d'),
      minutes_studied: minutes,
      lessons_completed: lessonsThisWeek.length
    }
  })

  // ── Activity Heatmap ───────────────────────────────────────────
  // Build a map of date → count from user_streaks.activity_dates
  // and supplement with lesson_progress.completed_at dates for density
  const dateCountMap: Record<string, number> = {}

  // From streak data
  ;(streak?.activity_dates ?? []).forEach((d: string) => {
    dateCountMap[d] = (dateCountMap[d] ?? 0) + 1
  })

  // Count actual lessons per day from lesson_progress for density
  lessonProgress.forEach((lp) => {
    if (!lp.completed_at) return
    const day = lp.completed_at.slice(0, 10)
    dateCountMap[day] = (dateCountMap[day] ?? 0) + 1
  })

  // Build last 365 days
  const activityDays: ActivityDay[] = Array.from({ length: 365 }, (_, i) => {
    const d = subDays(new Date(), 364 - i)
    const dateStr = format(d, 'yyyy-MM-dd')
    return { date: dateStr, count: dateCountMap[dateStr] ?? 0 }
  })

  // ── Course Progress Summaries ──────────────────────────────────
  const courseProgress: CourseProgressSummary[] = enrollments.map((e) => {
    const course = e.course as { id: string; title: string; thumbnail_url: string | null; category: string; lesson_count: number; duration_minutes: number }
    const completedCount = lessonProgress.filter((lp) => lp.course_id === course.id).length
    const courseQuizzes = quizAttempts.filter((a) => a.course_id === course.id && a.score !== null)
    const avgQuizScore = courseQuizzes.length > 0
      ? courseQuizzes.reduce((acc, a) => acc + (a.score ?? 0), 0) / courseQuizzes.length
      : null

    const timeSpent = lessonProgress
      .filter((lp) => lp.course_id === course.id)
      .reduce((acc, lp) => acc + ((lp.lesson as { duration_minutes: number } | null)?.duration_minutes ?? 0), 0)

    return {
      course_id: course.id,
      course_title: course.title,
      thumbnail_url: course.thumbnail_url,
      total_lessons: course.lesson_count ?? 0,
      completed_lessons: completedCount,
      avg_quiz_score: avgQuizScore ? Math.round(avgQuizScore) : null,
      time_spent_minutes: timeSpent,
      enrolled_at: e.enrolled_at,
      completed_at: e.completed_at ?? null
    }
  })

  // ── Skill Radar ────────────────────────────────────────────────
  const categoryScoreMap: Record<string, { total: number; count: number }> = {}

  quizAttempts.forEach((a) => {
    const category = (a.course as { category: string } | null)?.category ?? 'Other'
    if (a.score !== null) {
      if (!categoryScoreMap[category]) categoryScoreMap[category] = { total: 0, count: 0 }
      categoryScoreMap[category].total += a.score
      categoryScoreMap[category].count += 1
    }
  })

  const skillRadar: SkillRadarPoint[] = Object.entries(categoryScoreMap).map(([cat, { total, count }]) => ({
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    avg_score: Math.round(total / count),
    fullMark: 100
  }))

  return {
    stats: {
      total_lessons_completed: lessonProgress.length,
      total_time_hours: Math.round(totalTimeMinutes / 60 * 10) / 10,
      total_quizzes_taken: quizAttempts.length,
      avg_quiz_score: Math.round(avgScore),
      courses_completed: enrollments.filter((e) => e.completed_at).length,
      current_streak: streak?.current_streak ?? 0,
      longest_streak: streak?.longest_streak ?? 0
    },
    quizScoreHistory,
    weeklyActivity,
    activityDays,
    courseProgress,
    skillRadar
  }
}

export function useProgressAnalytics() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['progress-analytics', user?.id],
    queryFn: () => fetchProgressAnalytics(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,  // 5 minutes
  })
}
```

---

### 9.5 `useMessageThreads` + `useThread` + `useSendMessage` — `src/hooks/queries/useMessages.ts`

```typescript
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useMessageStore } from '@/store/messageStore'
import { MessageThread, Message } from '@/lib/types'
import { toast } from 'sonner'

// ── All threads for the current user ────────────────────────────
export function useMessageThreads(search?: string) {
  const user = useAuthStore((s) => s.user)
  const setUnreadForThread = useMessageStore((s) => s.setUnreadForThread)

  return useQuery<MessageThread[]>({
    queryKey: ['message-threads', user?.id, search],
    queryFn: async () => {
      // Fetch threads where user is user_a or user_b
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          user_a:profiles!message_threads_user_a_id_fkey(id, full_name, avatar_url, role, last_seen_at),
          user_b:profiles!message_threads_user_b_id_fkey(id, full_name, avatar_url, role, last_seen_at)
        `)
        .or(`user_a_id.eq.${user!.id},user_b_id.eq.${user!.id}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Shape each thread: attach the "other user" and compute has_unread
      return (data ?? [])
        .map((t) => {
          const isUserA = t.user_a_id === user!.id
          const otherUser = isUserA ? t.user_b : t.user_a
          const myReadAt = isUserA ? t.user_a_read_at : t.user_b_read_at

          const hasUnread = !myReadAt || new Date(t.last_message_at) > new Date(myReadAt)
          const thread: MessageThread = {
            ...t,
            other_user: otherUser,
            has_unread: hasUnread
          }

          // Sync unread into store for badge calculation
          setUnreadForThread(t.id, hasUnread ? 1 : 0)

          return thread
        })
        .filter((t) => {
          if (!search) return true
          return t.other_user.full_name.toLowerCase().includes(search.toLowerCase())
        })
    },
    enabled: !!user,
    staleTime: 1000 * 30,  // 30 seconds — messages are time-sensitive
  })
}

// ── Messages within a thread (paginated — 30 per page, oldest first) ──
export function useThread(threadId: string) {
  const user = useAuthStore((s) => s.user)

  return useInfiniteQuery({
    queryKey: ['thread', threadId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
        `)
        .eq('thread_id', threadId)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: false })   // newest first for pagination
        .range(pageParam, pageParam + 29)

      if (error) throw error
      // Reverse so messages display oldest-at-top
      return (data ?? []).reverse() as Message[]
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 30 ? allPages.flat().length : undefined,
    enabled: !!user && !!threadId,
    staleTime: 0,  // Always revalidate — messages are real-time
  })
}

// ── Send a message ────────────────────────────────────────────────
export function useSendMessage() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ threadId, body, recipientId }: { threadId: string; body: string; recipientId: string }) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('messages')
        .insert({ thread_id: threadId, sender_id: user.id, body: body.trim() })
        .select(`*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)`)
        .single()

      if (error) throw error

      // Update the thread's user_x_read_at (sender has read up to now)
      const isUserA = await getIsUserA(threadId, user.id)
      await supabase
        .from('message_threads')
        .update(isUserA
          ? { user_a_read_at: new Date().toISOString() }
          : { user_b_read_at: new Date().toISOString() })
        .eq('id', threadId)

      // Send notification to recipient (fire-and-forget)
      supabase.functions.invoke('send-notification', {
        body: {
          user_id: recipientId,
          type: 'new_message',
          title: `New message from ${user.user_metadata?.full_name ?? 'a user'}`,
          body: body.trim().slice(0, 80),
          action_url: `/messages/${threadId}`,
          actor_id: user.id
        }
      })

      return data as Message
    },
    onSuccess: (newMessage, variables) => {
      // Optimistically append the message to the thread cache
      qc.setQueryData(['thread', variables.threadId], (old: { pages: Message[][] } | undefined) => {
        if (!old) return old
        const pages = [...old.pages]
        // The last page in the infinite query is the most recent
        pages[pages.length - 1] = [...pages[pages.length - 1], newMessage]
        return { ...old, pages }
      })
      // Invalidate thread list so preview and timestamp update
      qc.invalidateQueries({ queryKey: ['message-threads'] })
    },
    onError: () => {
      toast.error('Failed to send message. Please try again.')
    }
  })
}

// Helper: determine if current user is user_a in a thread
async function getIsUserA(threadId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('message_threads')
    .select('user_a_id')
    .eq('id', threadId)
    .single()
  return data?.user_a_id === userId
}

// ── Mark a thread as read ──────────────────────────────────────────
export function useMarkThreadRead() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const clearUnread = useMessageStore((s) => s.clearUnreadForThread)

  return useMutation({
    mutationFn: async ({ threadId, isUserA }: { threadId: string; isUserA: boolean }) => {
      const field = isUserA ? 'user_a_read_at' : 'user_b_read_at'
      await supabase
        .from('message_threads')
        .update({ [field]: new Date().toISOString() })
        .eq('id', threadId)
    },
    onSuccess: (_, variables) => {
      clearUnread(variables.threadId)
      qc.invalidateQueries({ queryKey: ['message-threads'] })
    }
  })
}

// ── Find or create a thread between two users ─────────────────────
export function useStartThread() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (otherUserId: string): Promise<string> => {
      if (!user) throw new Error('Not authenticated')

      // Check for existing thread (either direction)
      const { data: existing } = await supabase
        .from('message_threads')
        .select('id')
        .or(
          `and(user_a_id.eq.${user.id},user_b_id.eq.${otherUserId}),` +
          `and(user_a_id.eq.${otherUserId},user_b_id.eq.${user.id})`
        )
        .maybeSingle()

      if (existing) return existing.id

      // Create a new thread
      const { data, error } = await supabase
        .from('message_threads')
        .insert({ user_a_id: user.id, user_b_id: otherUserId })
        .select('id')
        .single()

      if (error) throw error
      qc.invalidateQueries({ queryKey: ['message-threads'] })
      return data.id
    }
  })
}
```

---

### 9.6 `useNotifications` + mutations — `src/hooks/queries/useNotifications.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { AppNotification } from '@/lib/types'

// ── Paginated notification list ────────────────────────────────
export function useNotifications(page = 0, pageSize = 20) {
  const user = useAuthStore((s) => s.user)

  return useQuery<AppNotification[]>({
    queryKey: ['notifications', user?.id, page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(id, full_name, avatar_url)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) throw error
      return (data ?? []) as AppNotification[]
    },
    enabled: !!user,
    staleTime: 1000 * 30,
  })
}

// ── Unread count (for bell badge bootstrap on app load) ──────────
export function useUnreadNotificationCount() {
  const user = useAuthStore((s) => s.user)
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  return useQuery<number>({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .is('read_at', null)
      if (error) throw error
      const c = count ?? 0
      setUnreadCount(c)   // Sync into Zustand store
      return c
    },
    enabled: !!user,
    staleTime: 1000 * 60,  // Re-fetch every minute as a fallback
  })
}

// ── Mark single notification read ──────────────────────────────
export function useMarkNotificationRead() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const { decrementUnread, markPreviewRead } = useNotificationStore()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user!.id)
        .is('read_at', null)  // Only update if currently unread
      if (error) throw error
    },
    onMutate: (notificationId) => {
      // Optimistic update: immediately decrement badge and update preview
      decrementUnread()
      markPreviewRead(notificationId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', user?.id] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] })
    }
  })
}

// ── Mark ALL notifications read ────────────────────────────────
export function useMarkAllNotificationsRead() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const { markAllPreviewRead } = useNotificationStore()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .is('read_at', null)
      if (error) throw error
    },
    onMutate: () => {
      markAllPreviewRead()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    }
  })
}
```

---

### 9.7 `useSearch` — `src/hooks/queries/useSearch.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { SearchResults } from '@/lib/types'
import { useDebounce } from '@/hooks/useDebounce'

async function searchAll(query: string): Promise<SearchResults> {
  if (!query.trim()) return { courses: [], lessons: [], users: [], total: 0 }

  // Three parallel searches using Postgres full-text search (ilike fallback)
  const q = query.toLowerCase()

  const [coursesRes, lessonsRes, usersRes] = await Promise.all([
    // Courses — search on title and short_description
    supabase
      .from('courses')
      .select('id, title, slug, short_description, thumbnail_url, category, level')
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,short_description.ilike.%${q}%`)
      .limit(5),

    // Lessons — search on title, for enrolled user or free preview only
    supabase
      .from('lessons')
      .select('id, title, type, course_id, course:courses(id, title, slug)')
      .or(`title.ilike.%${q}%`)
      .limit(5),

    // Users — instructors only (students can't search other students)
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role, headline')
      .eq('role', 'instructor')
      .eq('is_active', true)
      .ilike('full_name', `%${q}%`)
      .limit(3),
  ])

  const courses = (coursesRes.data ?? []).map((c) => ({
    type: 'course' as const,
    id: c.id,
    title: c.title,
    subtitle: `${c.category} · ${c.level}`,
    url: `/catalog/${c.id}`,
    thumbnail_url: c.thumbnail_url
  }))

  const lessons = (lessonsRes.data ?? []).map((l) => {
    const course = l.course as { id: string; title: string; slug: string } | null
    return {
      type: 'lesson' as const,
      id: l.id,
      title: l.title,
      subtitle: course?.title ?? 'Unknown Course',
      url: `/learn/${course?.id}/lesson/${l.id}`,
      thumbnail_url: null
    }
  })

  const users = (usersRes.data ?? []).map((u) => ({
    type: 'user' as const,
    id: u.id,
    title: u.full_name,
    subtitle: u.headline ?? 'Instructor',
    url: `/profile/${u.id}`,
    thumbnail_url: u.avatar_url
  }))

  return {
    courses,
    lessons,
    users,
    total: courses.length + lessons.length + users.length
  }
}

export function useSearch(rawQuery: string) {
  const debouncedQuery = useDebounce(rawQuery, 300)

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchAll(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev  // keep previous results while typing
  })
}
```

---

## 10. REALTIME SUBSCRIPTIONS

### 10.1 `useMessageRealtime` — `src/hooks/realtime/useMessageRealtime.ts`

This hook is mounted inside `MessageThread` component when a thread is open. It subscribes to new messages in the current thread only (scoped subscription — not listening to all messages globally).

```typescript
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Message } from '@/lib/types'

export function useMessageRealtime(threadId: string | null) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!threadId) return

    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        },
        async (payload) => {
          // The realtime payload doesn't include joins — re-fetch the full message
          const { data: newMsg } = await supabase
            .from('messages')
            .select(`*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)`)
            .eq('id', payload.new.id)
            .single()

          if (!newMsg) return

          // Append to the TanStack Query cache
          qc.setQueryData(['thread', threadId], (old: { pages: Message[][], pageParams: unknown[] } | undefined) => {
            if (!old) return old
            const pages = old.pages.map((page, i) =>
              i === old.pages.length - 1 ? [...page, newMsg as Message] : page
            )
            return { ...old, pages }
          })

          // Also invalidate thread list to update preview and timestamp
          qc.invalidateQueries({ queryKey: ['message-threads'] })
        }
      )
      .subscribe()

    // CRITICAL: clean up on unmount or threadId change
    return () => {
      supabase.removeChannel(channel)
    }
  }, [threadId, qc])
}
```

---

### 10.2 `useNotificationRealtime` — `src/hooks/realtime/useNotificationRealtime.ts`

This hook is mounted ONCE at the application root level (inside the authenticated layout wrapper, not in individual pages). It runs as long as the user is logged in.

```typescript
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { AppNotification } from '@/lib/types'

export function useNotificationRealtime() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const { prependNotification } = useNotificationStore()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new as AppNotification
          // Prepend to store (updates bell badge + dropdown preview)
          prependNotification(notification)
          // Invalidate full notifications list (in case user is on /notifications page)
          qc.invalidateQueries({ queryKey: ['notifications', user.id] })
          qc.invalidateQueries({ queryKey: ['notifications-unread-count', user.id] })
        }
      )
      .subscribe()

    return () => {
      // CRITICAL: always clean up or ghost subscriptions accumulate
      supabase.removeChannel(channel)
    }
  }, [user?.id, qc, prependNotification])
}
```

**Mount this in `StudentLayout.tsx`, `InstructorLayout.tsx`, and `AdminLayout.tsx`**:

```tsx
// Inside any authenticated layout component, add:
import { useNotificationRealtime } from '@/hooks/realtime/useNotificationRealtime'

// In the component body:
useNotificationRealtime()  // mounts subscription for this session
```

---

### 10.3 Online Presence Heartbeat — `usePresenceHeartbeat`

```typescript
// src/hooks/realtime/usePresenceHeartbeat.ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000  // 5 minutes

export function usePresenceHeartbeat() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) return

    // Update immediately on mount (login)
    const updateLastSeen = () => {
      supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id)
        .then()  // fire-and-forget
    }

    updateLastSeen()
    const interval = setInterval(updateLastSeen, HEARTBEAT_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [user?.id])
}
```

> A user is considered "online" if their `last_seen_at` is within the last 10 minutes. The `OnlinePresenceDot` component computes this locally: `new Date().getTime() - new Date(last_seen_at).getTime() < 10 * 60 * 1000`.

---

## 11. FILE STRUCTURE — NEW FILES

```
src/
├── store/
│   ├── notificationStore.ts       ← REPLACE Phase 1 stub (full implementation)
│   └── messageStore.ts            ← NEW
│
├── hooks/
│   ├── queries/
│   │   ├── useCurrentProfile.ts   ← REPLACE Phase 1 useProfile.ts (or extend it)
│   │   ├── useUpdateProfile.ts    ← NEW (or co-locate in useCurrentProfile.ts)
│   │   ├── useProgressAnalytics.ts ← NEW
│   │   ├── useMessages.ts         ← NEW (threads + messages + mutations)
│   │   ├── useNotifications.ts    ← NEW (list + mutations)
│   │   └── useSearch.ts           ← NEW
│   ├── mutations/
│   │   ├── useUploadAvatar.ts     ← NEW
│   │   └── useChangePassword.ts   ← NEW
│   └── realtime/
│       ├── useMessageRealtime.ts  ← NEW
│       ├── useNotificationRealtime.ts ← NEW
│       └── usePresenceHeartbeat.ts ← NEW
│
├── components/
│   ├── profile/
│   │   ├── AvatarUploader.tsx         ← NEW
│   │   ├── ProfileForm.tsx            ← NEW
│   │   ├── PasswordChangeForm.tsx     ← NEW
│   │   ├── NotificationPreferencesForm.tsx ← NEW
│   │   ├── SocialLinksForm.tsx        ← NEW
│   │   └── ProfileCard.tsx            ← NEW
│   │
│   ├── progress/
│   │   ├── ScoreHistoryChart.tsx      ← NEW
│   │   ├── WeeklyActivityChart.tsx    ← NEW
│   │   ├── CourseCompletionCard.tsx   ← NEW (different from Phase 3 CourseProgressWidget)
│   │   ├── ActivityHeatmap.tsx        ← NEW
│   │   ├── SkillBreakdownChart.tsx    ← NEW
│   │   └── StatSummaryRow.tsx         ← NEW
│   │
│   ├── messages/
│   │   ├── ThreadList.tsx             ← NEW
│   │   ├── ThreadListItem.tsx         ← NEW
│   │   ├── MessageBubble.tsx          ← NEW
│   │   ├── MessageComposer.tsx        ← NEW
│   │   ├── MessageThread.tsx          ← NEW
│   │   ├── MessageSearchBar.tsx       ← NEW
│   │   ├── NewMessageModal.tsx        ← NEW
│   │   ├── OnlinePresenceDot.tsx      ← NEW
│   │   └── EmptyThreadState.tsx       ← NEW
│   │
│   ├── notifications/
│   │   ├── NotificationItem.tsx       ← NEW
│   │   ├── NotificationBell.tsx       ← REPLACE Phase 1 stub
│   │   └── EmptyNotificationsState.tsx ← NEW
│   │
│   ├── search/
│   │   ├── GlobalSearchModal.tsx      ← REPLACE Phase 1 stub
│   │   ├── SearchResultGroup.tsx      ← NEW
│   │   └── SearchResultItem.tsx       ← NEW
│   │
│   └── layout/
│       └── Topbar.tsx                 ← UPDATE: wire real bell + search + message badge
│
└── pages/
    ├── student/
    │   ├── ProfilePage.tsx            ← REPLACE Phase 1 stub
    │   ├── ProfileEditPage.tsx        ← NEW (was not a separate stub — add route)
    │   ├── ProgressPage.tsx           ← REPLACE Phase 1 stub
    │   └── PaymentsPage.tsx           ← Minimal stub — Phase 9 fills it in
    ├── messages/
    │   └── MessagesPage.tsx           ← REPLACE Phase 1 stub
    └── notifications/
        └── NotificationsPage.tsx      ← REPLACE Phase 1 stub
```

---

## 12. PAGE SPECIFICATIONS

### 12.1 Profile View — `/profile`

**Layout**: `StudentLayout` (roles: student, instructor, admin all use this page via `RoleAwareLayout`).

**Two-column layout** (desktop: 30/70; mobile: stacked):

**Left column — identity card**:
```
┌────────────────────────────┐
│  [Avatar — 96×96 rounded]  │
│  [Full Name — text-xl bold]│
│  [Headline — text-sm muted]│
│  [Role badge: Student]     │
│                            │
│  Bio paragraph text        │
│                            │
│  🌐 website.com            │
│  🐦 @twitter_handle        │
│  💼 linkedin.com/in/...    │
│  🐙 github.com/username    │
│                            │
│  Member since: May 2025    │
│                            │
│  [✏ Edit Profile] button   │
└────────────────────────────┘
```

**Right column — tabs**:

Tab 1: **Activity** — shows recent lesson completions, quiz results, and assignments (last 10 activities, pulled from `lesson_progress` + `quiz_attempts` + `assignment_submissions`, sorted by date descending).

Tab 2: **Enrolled Courses** — same `EnrolledCourseCard` grid from Phase 3 My Courses page. Reuse `useEnrolledCourses`.

Tab 3: **Achievements** — stub card: "Badges and certificates — coming soon in a future update." (Phase 8 will fill this in).

**Social links**: Only render links that are non-null. Use `lucide-react` icons: `Globe`, `Twitter`, `Linkedin`, `Github`. Links open in a new tab (`target="_blank" rel="noopener noreferrer"`).

**Avatar**: Uses `<Avatar>` from shadcn/ui with the Supabase public URL. If `avatar_url` is null: show initials from `full_name` (first letter of first name + first letter of last name, uppercased).

---

### 12.2 Profile Edit — `/profile/edit`

**Layout**: `StudentLayout`.

This is a multi-section form page. Use shadcn `Card` for each section. All sections save independently (not one giant save button at the bottom).

#### Section 1: Photo
`AvatarUploader` component — see Component Spec in Section 13.1.

#### Section 2: Basic Info
Form fields (React Hook Form + Zod):
```
Full Name *         [text input]
Headline            [text input, max 100 chars, placeholder: "Full-Stack Developer · Learner"]
Bio                 [textarea, max 500 chars, 4 rows]
Department          [text input]
```
`[Save Changes]` button — calls `useUpdateProfile`. On success: toast "Profile updated." On error: toast "Failed to update."

#### Section 3: Social Links
```
Website             [url input, placeholder: "https://yoursite.com"]
Twitter             [text input, placeholder: "@username (without @)"]
LinkedIn URL        [url input, placeholder: "https://linkedin.com/in/yourname"]
GitHub              [text input, placeholder: "username (without @)"]
```
Same save button → `useUpdateProfile`. Validate URLs with Zod: `z.string().url().optional().or(z.literal(''))`.

#### Section 4: Change Password

Only shown for email+password users (not Google OAuth users). Check: `user.app_metadata.provider === 'email'`.

```
Current Password    [password input]
New Password        [password input, min 8 chars]
Confirm Password    [password input, must match new]
```

`[Change Password]` → `useChangePassword` mutation.

```typescript
// src/hooks/mutations/useChangePassword.ts
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // Re-authenticate with current password first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('No email on account')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })
      if (signInError) throw new Error('Current password is incorrect')

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
    },
    onSuccess: () => toast.success('Password changed successfully.'),
    onError: (err: Error) => toast.error(err.message)
  })
}
```

#### Section 5: Notification Preferences

`NotificationPreferencesForm` — two groups of toggle switches:

**In-App Notifications** (shadcn `Switch`):
- New message from instructor
- Assignment graded
- Quiz results
- Platform announcements
- Deadline reminders

**Email Notifications**:
- New message from instructor
- Assignment graded
- Quiz results
- Platform announcements
- Deadline reminders

Each toggle: calls `useUpdateProfile({ notification_preferences: { ...existing, [key]: newValue } })` on `onChange`. No explicit Save button — auto-saves on toggle.

---

### 12.3 Progress Page — `/profile/progress`

**Layout**: `StudentLayout`.

**Loading state**: Every section has a skeleton. Never show empty charts — show skeleton until data resolves.

**Section layout** (top to bottom):

#### Header
```
"My Learning Progress"                [Date range selector: "Last 30 days / Last 3 months / All time"]
"Track your quiz scores, study time, and learning habits"
```

#### Stat Summary Row — `StatSummaryRow`
4 horizontal stats in one card:
```
[📚 Courses Enrolled: 5]  [✓ Lessons Done: 42]  [⏱ Hours Studied: 18.5]  [📊 Avg Quiz Score: 78%]
```

#### Two-column row (60/40):

**Left (60%) — `ScoreHistoryChart`**:
- Recharts `LineChart`
- X-axis: date of quiz attempt (`date_format: 'MMM d'`)
- Y-axis: score percentage (0–100)
- Each point: a quiz attempt
- Color: green if `passed`, red if not
- Tooltip: shows quiz name + score + "Passed / Failed"
- If no quiz data: empty state illustration + "No quiz attempts yet."

```tsx
// ScoreHistoryChart.tsx — key recharts setup
<ResponsiveContainer width="100%" height={280}>
  <LineChart data={quizScoreHistory}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
    <Tooltip content={<QuizScoreTooltip />} />
    <Line
      type="monotone"
      dataKey="score"
      stroke="hsl(var(--primary))"
      strokeWidth={2}
      dot={(props) => (
        <circle
          cx={props.cx} cy={props.cy} r={4}
          fill={props.payload.passed ? '#10B981' : '#EF4444'}
          stroke="white" strokeWidth={1}
        />
      )}
    />
    <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Pass (70%)', fontSize: 10 }} />
  </LineChart>
</ResponsiveContainer>
```

**Right (40%) — `SkillBreakdownChart`**:
- Recharts `RadarChart` showing avg quiz score per course category
- If fewer than 3 categories: falls back to a simple horizontal bar list
- Colors: match category colors from Phase 2 design system

#### Full-width — `WeeklyActivityChart`

- Recharts `BarChart`
- X-axis: last 12 weeks (week start date label: "May 12")
- Y-axis: minutes studied (auto-scaled; show "2h" for 120min using tick formatter)
- Bars: blue (`primary`)
- Tooltip: "X lessons · Y hours Z min"
- Responsive width: fills container

```tsx
const formatMinutes = (minutes: number) => {
  if (minutes === 0) return '0'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
```

#### Full-width — `ActivityHeatmap`

365-day GitHub-style contribution heatmap. No external library — implemented as a pure CSS grid.

```
         Jan   Feb   Mar   Apr   May
Mon  [■][□][□][■][■][□][■][■][■][■][□]...
Wed  [□][■][■][□][□][■][□][□][■][□][□]...
Fri  [■][□][□][■][□][□][■][□][□][■][■]...
```

Each cell is a `div` (w-3 h-3 rounded-sm). Color based on lesson count:
- `count === 0` → `bg-muted/30`
- `count === 1` → `bg-primary/30`
- `count === 2–3` → `bg-primary/60`
- `count >= 4` → `bg-primary`

Tooltip on hover: "3 lessons on May 15, 2025"

Layout: CSS grid with `grid-template-rows: repeat(7, 1fr)` (Mon–Sun). Weeks are columns. Month labels above the grid.

```typescript
// ActivityHeatmap.tsx — grid construction
const weeks: ActivityDay[][] = []
let week: ActivityDay[] = []
activityDays.forEach((day, i) => {
  const dayOfWeek = new Date(day.date).getDay()
  if (i === 0) {
    // Pad the first week with empty cells to align to correct day
    for (let j = 0; j < dayOfWeek; j++) week.push({ date: '', count: -1 })
  }
  week.push(day)
  if (week.length === 7) {
    weeks.push(week)
    week = []
  }
})
if (week.length > 0) weeks.push(week)
```

#### Full-width — Course Completion Section

Heading: "Progress Per Course"

Per enrolled course (sorted by enrolled_at desc):
```
[thumbnail 40×40]  [Course Title]                          [Avg Quiz: 82% ●]
                   [████████████░░░░░░░░ 60%]  18/30 lessons
                   Enrolled May 1 · 4.5 hrs studied
```

Use `Progress` component from shadcn/ui for the bar. If `avg_quiz_score` is null: show "No quizzes" instead of the score badge.

---

### 12.4 Messages — `/messages` and `/messages/:threadId`

**Layout**: `StudentLayout`.

This is a full-height split-panel page. The page itself takes `h-[calc(100vh-4rem)]` (full viewport minus topbar height) with `overflow: hidden`.

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR                                                              │
├────────────────────┬─────────────────────────────────────────────────┤
│ LEFT PANEL (w-80)  │  RIGHT PANEL (flex-1)                           │
│ border-r           │                                                 │
│                    │                                                 │
│ "Messages"    [✏]  │  [Select a conversation to start messaging]     │
│ [Search bar]       │  or                                             │
│                    │  [Active thread with messages]                  │
│ Thread 1 (unread•) │                                                 │
│ Thread 2           │                                                 │
│ Thread 3           │                                                 │
│ Thread 4           │                                                 │
│                    │                                                 │
│                    │                                                 │
└────────────────────┴─────────────────────────────────────────────────┘
```

On mobile: left panel is full width by default; selecting a thread replaces left with right panel (use `activeThreadId === null` as the toggle). A `[← Back]` button in the thread header returns to the list.

**Thread routing**: `/messages` shows the split panel with no thread selected. `/messages/:threadId` selects that thread — updates `messageStore.activeThreadId` and renders the right panel. On desktop, both panels are always visible. On mobile, the route change triggers which panel shows.

#### Left Panel — Thread List

```
[🔍 Search conversations...]

┌──────────────────────────────────────┐
│  [Avatar]  Sarah Khan          2m ago│  ← unread: bold name + blue dot
│  [Instructor]  Thanks for clarifyi…  │
├──────────────────────────────────────┤
│  [Avatar]  James Obi           1d ago│
│  [Instructor]  Sounds great!         │
└──────────────────────────────────────┘
```

`ThreadListItem`:
- Left: `Avatar` with `OnlinePresenceDot` overlay (green dot if `last_seen_at` < 10 min ago)
- Middle: bold name (if unread) + role badge (tiny "Instructor" tag) + preview text (1 line truncated)
- Right: relative timestamp (`formatDistanceToNow(date, { addSuffix: true })`) + blue dot if `has_unread`
- Active thread: `bg-primary/10 border-l-2 border-primary`
- Clicking: navigate to `/messages/:threadId` + call `useMarkThreadRead`

**`[✏ New Message]` button** (top right of left panel): opens `NewMessageModal`:
```
"Start new conversation"
[Search instructors...]
  [Avatar] Sarah Khan — Web Development
  [Avatar] James Obi — Design Fundamentals
[Start Conversation] button
```

Lists all instructors from enrolled courses. On select + button click: calls `useStartThread(instructorId)` → navigates to `/messages/:newThreadId`.

#### Right Panel — Message Thread

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Avatar] Sarah Khan              🟢 Online now         [···]         │
│ Web Development Instructor                                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ── May 22, 2025 ──────────────────────────────────────────           │
│                                                                      │
│  [Avatar]                                                            │
│  Hi! I had a question about useEffect...          10:32 AM           │
│                                                                      │
│                           Sure! The dependency array...   10:38 AM  │
│                                                 [Avatar] (right)     │
│                                                                      │
│  What happens if I omit the array?               10:40 AM           │
│                                                                      │
│                           Then the effect runs...        10:42 AM   │
│                                                                      │
│ ── Today ────────────────────────────────────────────────            │
│                                                                      │
│  Thanks for the clarification!                   2:15 PM            │
│                                             ✓✓ Seen  (if read)      │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ [  Type a message...                           ] [Send ↑]            │
└──────────────────────────────────────────────────────────────────────┘
```

**`MessageBubble`** spec:
- Own messages: right-aligned, `bg-primary text-primary-foreground rounded-2xl rounded-tr-sm`
- Other's messages: left-aligned, `bg-muted rounded-2xl rounded-tl-sm`
- Timestamp: tiny, `text-xs text-muted-foreground`, shown below bubble
- Read receipt: "✓✓ Seen" only on the last message sent by the current user, if `other_user.read_at > message.sent_at`
- Soft-deleted messages: render `[Message deleted]` in italic muted text — do not hide the bubble entirely (preserves conversation flow)

**Date separators**: Between messages from different calendar days, insert a centered date separator: `── May 22, 2025 ──` (use `format(date, 'MMMM d, yyyy')`).

**Infinite scroll** for older messages: A sentinel `div` at the TOP of the message list (not bottom). When it comes into view (`useInView` from `react-intersection-observer`), call `fetchNextPage()` from `useThread`. New pages are prepended above current messages. Scroll position must not jump — capture `scrollHeight` before prepend and restore after.

**`MessageComposer`**:
- Simple `textarea` (not TipTap — keep it lightweight for messaging)
- Auto-resizes up to 6 rows (`min-h-[40px] max-h-[144px]`)
- `Enter` sends (no shift+enter newline? Let users use shift+enter for newlines)
- `Shift+Enter` inserts a newline
- Send button disabled if `body.trim() === ''` or `isPending` (mutation in flight)
- On send: calls `useSendMessage`, clears textarea, scrolls to bottom

**Scroll to bottom**: On initial load AND after sending a message, scroll the message container to the bottom. Use a `bottomRef` div and `bottomRef.current?.scrollIntoView({ behavior: 'smooth' })`.

---

### 12.5 Notifications — `/notifications`

**Layout**: `StudentLayout`.

**Header**:
```
"Notifications"                              [Mark all as read] (button, grayed out if 0 unread)
```

**Filter tabs** (shadcn `Tabs`):
```
[All]  [Unread (X)]  [Messages]  [Grades]  [Announcements]
```

Each tab filters `notifications` by `read_at IS NULL` for Unread, or by `type` for the category tabs.

**Notification list** (paginated, 20 per page):

Each `NotificationItem`:
```
┌──────────────────────────────────────────────────────────────────────┐
│  [Icon]  [Title — semibold if unread, normal if read]   [timestamp] │
│  [blue dot if unread]  [Body text — text-sm text-muted]             │
│           [Actor avatar if actor_id] by Sarah Khan                  │
└──────────────────────────────────────────────────────────────────────┘
```

- Left icon per type:
  - `new_message` → `MessageSquare` (blue)
  - `quiz_passed` → `Trophy` (green)
  - `quiz_failed` → `XCircle` (red)
  - `assignment_graded` → `ClipboardCheck` (amber)
  - `course_announcement` → `Megaphone` (purple)
  - `deadline_reminder` → `Clock` (orange)
  - `course_complete` → `GraduationCap` (green)
  - default → `Bell` (gray)
- Unread notifications: `bg-primary/5` background + blue dot
- Clicking a notification:
  1. If `read_at` is null: call `useMarkNotificationRead(id)` 
  2. If `action_url` is set: navigate to `action_url`
- Hover: `hover:bg-muted/50 cursor-pointer`

**Empty state** (no notifications at all):
```
[Bell icon, large, muted]
"You're all caught up!"
"New notifications about your courses will appear here."
```

**Load more**: "Load more" button at bottom (not infinite scroll — avoid UX confusion with intentional page review). Increments `page` counter for `useNotifications`.

---

## 13. COMPONENT SPECIFICATIONS

### 13.1 `AvatarUploader` — `src/components/profile/AvatarUploader.tsx`

```
┌────────────────────────────────────────┐
│  Current avatar:                       │
│  [96×96 rounded-full avatar]           │
│  [📷 Change Photo]                     │
│                                        │
│  — or drop a photo here —              │
│                                        │
│  Max 2MB · JPG, PNG, WebP, GIF        │
└────────────────────────────────────────┘
```

Behavior:
- `[Change Photo]` → triggers `<input type="file" accept="image/*">` via ref click
- Drag-and-drop zone (same as Phase 3 `FileUploadZone` but for images only, 2MB max)
- On file select: show a `<img>` preview of the selected file using `URL.createObjectURL(file)` — DO NOT upload immediately
- Show `[Save Photo]` and `[Cancel]` buttons after preview
- `[Save Photo]` → calls `useUploadAvatar(file)` → shows `isPending` spinner on avatar
- `[Cancel]` → clears the selected file, returns to current avatar
- On `isPending`: show spinner overlay on the preview image; disable both buttons
- On success: preview updates to the new `avatar_url` from the server (via query invalidation)
- Show inline error (not toast) for invalid file type or size

---

### 13.2 `NotificationBell` — `src/components/notifications/NotificationBell.tsx`

Replaces the Phase 1 stub in `Topbar.tsx`. This is the bell icon in the topbar.

```
[🔔 Bell icon]
 [● 3]  ← red badge, rounded-full, min-w-4 min-h-4 text-xs
```

On click → opens a `Popover` (not a Dialog) anchored to the bell icon:

```
┌─────────────────────────────────────────┐
│  Notifications                [Mark all]│
├─────────────────────────────────────────┤
│  [MessageSquare] New message from Sarah  │
│  "You have a reply from your instruct…" │
│  2m ago                                 │
├─────────────────────────────────────────┤
│  [Trophy] Quiz passed! 🎉               │
│  "You scored 85% on React Fundamentals" │
│  3h ago                                 │
├─────────────────────────────────────────┤
│  [ClipboardCheck] Assignment graded     │
│  "Your submission received 88/100"      │
│  1d ago                                 │
├─────────────────────────────────────────┤
│  [View all notifications →]             │
└─────────────────────────────────────────┘
```

- Shows up to 5 most recent from `notificationStore.previewNotifications`
- On initial mount: calls `useUnreadNotificationCount()` to hydrate store
- `[Mark all]` button calls `useMarkAllNotificationsRead()`
- Clicking a notification item: marks it read + closes popover + navigates to `action_url` or `/notifications`
- `[View all →]` navigates to `/notifications`
- If `unreadCount === 0`: badge not rendered (not even "0")
- Badge max display: "9+" for count > 9

---

### 13.3 `GlobalSearchModal` — `src/components/search/GlobalSearchModal.tsx`

Uses `cmdk` library. Replaces the Phase 1 stub.

```
┌──────────────────────────────────────────────────────────────────┐
│  [🔍 Search courses, lessons, people...]              [Esc ×]   │
├──────────────────────────────────────────────────────────────────┤
│  Recent searches                                                 │
│  [Clock] React hooks                                             │
│  [Clock] TypeScript generics                                     │
├──────────────────────────────────────────────────────────────────┤
│  Courses                                                         │
│  [thumbnail] React for Beginners                                 │
│              Programming · Beginner                              │
│  [thumbnail] TypeScript Deep Dive                                │
│              Programming · Intermediate                          │
├──────────────────────────────────────────────────────────────────┤
│  Lessons                                                         │
│  [FileText]  "useEffect and Side Effects" — React Course         │
│  [Play]      "TypeScript Generics Explained" — TS Course         │
├──────────────────────────────────────────────────────────────────┤
│  People                                                          │
│  [Avatar]    Sarah Khan — Instructor                             │
└──────────────────────────────────────────────────────────────────┘
```

**Keyboard behavior** (handled by `cmdk` automatically):
- `↑` / `↓` navigate items
- `Enter` selects the highlighted item
- `Esc` closes the modal
- cmd+K / Ctrl+K opens (registered globally in `useEffect` at the layout level)

**Implementation**:

```tsx
// GlobalSearchModal.tsx
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// cmdk renders inside a Dialog for focus-trap + esc-to-close
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-2xl p-0 overflow-hidden">
    <Command shouldFilter={false}>  {/* We handle filtering via useSearch */}
      <Command.Input
        placeholder="Search courses, lessons, people..."
        value={query}
        onValueChange={setQuery}
      />
      <Command.List>
        <Command.Empty>
          {query.length >= 2 ? 'No results found.' : 'Start typing to search...'}
        </Command.Empty>
        {/* Render SearchResultGroup components */}
      </Command.List>
    </Command>
  </DialogContent>
</Dialog>
```

**Recent searches**: Stored in `localStorage` key `'eduflow-recent-searches'` as a `string[]` (last 5). When a result is selected, prepend the search query to this list and trim to 5. Shown only when `query === ''`.

**Navigation on select**: Close modal → `navigate(result.url)`.

**Open/close shortcut**:
```typescript
// Mount in each layout's useEffect
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen((prev) => !prev)
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])
```

---

### 13.4 `OnlinePresenceDot` — `src/components/messages/OnlinePresenceDot.tsx`

```typescript
interface OnlinePresenceDotProps {
  lastSeenAt: string | null
  size?: 'sm' | 'md'  // sm = w-2 h-2, md = w-3 h-3
}

// A user is "online" if last_seen_at < 10 minutes ago
const isOnline = lastSeenAt
  ? Date.now() - new Date(lastSeenAt).getTime() < 10 * 60 * 1000
  : false
```

Renders as a `div` with `bg-green-500` (online) or `bg-muted` (offline), `rounded-full`. Applied as absolute positioning on top of the Avatar component.

---

### 13.5 `ActivityHeatmap` — `src/components/progress/ActivityHeatmap.tsx`

Pure CSS/React implementation. No external library. Key implementation notes:

- The grid is `display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 1fr)` — this creates a calendar that grows rightward week by week.
- Each cell: `w-3 h-3 rounded-sm cursor-default`
- Tooltip on hover: use `title` attribute (simple, no Radix needed for this) or a `Tooltip` from shadcn if you want styled tooltips.
- Month labels: rendered as a separate row above the grid. Calculate the first column index of each month start to align labels.
- Legend at bottom-right:
  ```
  Less [□][□][□][□][□] More
  (muted/30 → muted → primary/30 → primary/60 → primary)
  ```
- Wrap in a `ScrollArea` (horizontal) on mobile so narrow screens can scroll through the full 52-week grid.

---

## 14. TOPBAR UPDATES

Update `src/components/layout/Topbar.tsx` to wire these features:

### 14.1 Global Search Trigger

```tsx
// In Topbar — search button wiring
const [searchOpen, setSearchOpen] = useState(false)

// Register cmd+K
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])

// In JSX:
<button
  onClick={() => setSearchOpen(true)}
  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted transition-colors"
>
  <Search className="h-4 w-4" />
  Search...
  <kbd className="ml-2 text-xs bg-muted rounded px-1">⌘K</kbd>
</button>

<GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
```

### 14.2 Notification Bell

```tsx
// Replace the Phase 1 stub bell button with:
<NotificationBell />
```

### 14.3 Messages Badge

```tsx
const totalUnread = useMessageStore((s) => s.totalUnread)

// Messages icon in topbar:
<button
  onClick={() => navigate('/messages')}
  className="relative p-2 rounded-lg hover:bg-muted"
>
  <MessageSquare className="h-5 w-5" />
  {totalUnread > 0 && (
    <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-xs rounded-full min-w-4 h-4 flex items-center justify-center px-1">
      {totalUnread > 9 ? '9+' : totalUnread}
    </span>
  )}
</button>
```

---

## 15. ROUTING ADDITIONS TO `App.tsx`

Add or update these routes. Do not remove existing routes:

```tsx
// Student / shared profile routes
<Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
<Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
<Route path="/profile/progress" element={<ProtectedRoute><RoleGuard roles={['student']}><ProgressPage /></RoleGuard></ProtectedRoute>} />
<Route path="/profile/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />

// Public instructor profile (for students to view instructor profiles from search)
<Route path="/profile/:userId" element={<ProfilePage />} />

// Messages
<Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
<Route path="/messages/:threadId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

// Notifications
<Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
```

> `MessagesPage` handles both `/messages` (no active thread) and `/messages/:threadId` (thread selected). The `threadId` param is read via `useParams()` inside `MessagesPage` and used to set `messageStore.activeThreadId`. This approach avoids a nested `<Outlet />` layout — the split panel is self-contained inside `MessagesPage`.
>
> `/profile/:userId` — the `ProfilePage` component uses `useParams()` to determine if it's viewing own profile (`userId === user.id`) or another user's profile. If own profile, it shows the edit button. If another user's (public view), it hides the edit button and shows a condensed version (no private stats, no notification prefs).

---

## 16. RESPONSIVE BEHAVIOR

| Component | Mobile (<768px) | Tablet (768–1024px) | Desktop (>1024px) |
|-----------|----------------|---------------------|-------------------|
| Profile page | Single column | Single column | 30/70 split |
| Profile edit sections | Full width stacked | Full width stacked | max-w-2xl centered |
| Progress stat row | 2×2 grid | 4 in a row | 4 in a row |
| ScoreHistoryChart | Full width, h-200 | Full width, h-260 | 60% col, h-280 |
| SkillRadarChart | Full width (stacked below score chart) | Full width | 40% col |
| WeeklyActivityChart | Full width, h-200 | Full width, h-240 | Full width, h-260 |
| ActivityHeatmap | Horizontal scroll inside ScrollArea | Full width (may scroll) | Full width |
| Course completion cards | 1 column | 1 column | 1 column (full width) |
| Messages — split panel | Single panel (toggle list/thread) | Single panel | 320px left + flex-1 right |
| Messages — thread | Full screen | Full screen | Right panel fills |
| Thread list search bar | Full width | Full width | Full width in left panel |
| Notification list | Full width cards | Full width cards | max-w-2xl centered |
| GlobalSearchModal | w-[95vw] max-w-none | max-w-xl | max-w-2xl |
| NotificationBell dropdown | w-80 (careful on mobile — anchor to right edge) | w-96 | w-96 |

---

## 17. LOADING AND ERROR STATES

### Profile Page
- **Loading**: `ProfileCardSkeleton` (avatar circle + 3 text lines) + tab skeleton
- **Error**: `<ErrorState title="Couldn't load profile" action={{ label: 'Retry', onClick: refetch }} />`

### Profile Edit
- **Saving**: Each section's save button shows a `<Loader2 className="animate-spin" />` icon while `isPending`
- **Avatar upload**: Spinner overlay on the avatar preview while `isUploadPending`
- **Validation errors**: Inline below each field (React Hook Form `fieldState.error.message`)

### Progress Page
- **Loading**: Skeleton for each chart section: a gray rounded rectangle matching the chart's approximate height
- **No data (new student with no activity)**: Each chart shows a friendly empty state:
  - ScoreHistoryChart: "Take your first quiz to see your score history here."
  - WeeklyActivityChart: "Complete your first lesson to start tracking your study time."
  - ActivityHeatmap: Shows the full 365-day grid but all cells are muted (count 0 everywhere) — this is visually meaningful (it shows the span of time even with no activity).
  - SkillRadarChart: "Complete quizzes across different course categories to build your skill profile."

### Messages
- **Loading thread list**: 4 `ThreadListItemSkeleton` rows
- **Loading messages**: 8 `MessageBubbleSkeleton` components of varying widths
- **Empty thread state (no conversations yet)**: 
  ```
  [ChatBubble icon — large, muted]
  "No conversations yet"
  "Start by messaging one of your instructors."
  [New Message] button
  ```
- **Error loading thread**: `<ErrorState compact title="Couldn't load messages" action={{ label: 'Retry', onClick: refetch }} />`
- **Send failure**: Toast error "Failed to send message." Message is NOT added to the UI (do not optimistically add messages that fail — avoid ghost messages in conversations)

### Notifications
- **Loading**: 5 `NotificationItemSkeleton` rows
- **Empty (no notifications ever)**: `EmptyNotificationsState` component with bell illustration
- **Error**: `<ErrorState title="Couldn't load notifications" action={{ label: 'Retry', onClick: refetch }} />`

### Global Search
- **Searching** (`isLoading && query.length >= 2`): Show a `<Loader2>` spinner inside the `<Command.Empty>` area
- **No results**: `<Command.Empty>` renders "No results found for '{query}'."
- **Error**: Silently fall back to showing previous results (do not crash the modal on search error)

---

## 18. ACCEPTANCE CRITERIA

### Profile

- [ ] `/profile` renders full profile data from Supabase (not mock data)
- [ ] Own profile: `[Edit Profile]` button visible; others' profiles: no edit button
- [ ] Avatar shows initials fallback when `avatar_url` is null
- [ ] `/profile/edit` — all form sections load pre-populated with existing data
- [ ] Profile form saves correctly; navigating back to `/profile` shows updated data
- [ ] Avatar upload: preview shown before save; spinner during upload; avatar updates after save
- [ ] Invalid avatar (too large or wrong type): inline error shown, no upload attempted
- [ ] Password change: correct validation; wrong current password shows "Current password is incorrect"
- [ ] Password change not shown for Google OAuth users
- [ ] Notification preferences toggles auto-save on toggle; persisted after page refresh

### Progress Analytics

- [ ] All 4 chart types render without crashing
- [ ] Charts use real data from Supabase (quiz_attempts, lesson_progress, enrollments, user_streaks)
- [ ] Quiz score line chart: each point represents one quiz attempt, tooltip shows quiz name and score
- [ ] Pass threshold reference line visible at 70% on score chart
- [ ] Weekly activity bar chart: shows last 12 weeks; correct hours totals
- [ ] Activity heatmap: 365 days rendered; today's cell visible; color intensity reflects lesson count
- [ ] Course completion section: each enrolled course appears; progress bar % matches `enrollments.progress_pct`
- [ ] Skill radar chart: renders when at least 2 course categories have quiz attempts
- [ ] Empty states render correctly for a new user with no activity
- [ ] Stat summary row: all 4 numbers are correct and match Supabase counts

### Messages

- [ ] Thread list loads all threads for current user, sorted by most recent message
- [ ] Unread threads: bold name + blue dot visible
- [ ] Messages icon in topbar shows correct unread thread count badge
- [ ] Selecting a thread: messages load; thread marked as read; unread badge decreases
- [ ] Sending a message: appears immediately in thread (optimistic update) without full page refresh
- [ ] New message from other user: appears in thread without page refresh (Realtime)
- [ ] Thread list timestamp updates after receiving a new message (Realtime)
- [ ] `NewMessageModal`: lists instructors from enrolled courses; selecting one starts a thread
- [ ] Thread search bar filters correctly by contact name
- [ ] Mobile: left panel / right panel toggle works correctly
- [ ] `[← Back]` on mobile returns to thread list
- [ ] Soft-deleted messages render as `[Message deleted]`
- [ ] Date separators appear between messages from different days
- [ ] Scroll-to-bottom on initial load and after sending
- [ ] Load-older-messages: scrolling to top of thread loads previous page; scroll position does not jump
- [ ] Online presence dot: green if `last_seen_at < 10 min ago`; gray otherwise
- [ ] Realtime channel cleaned up on thread change and on component unmount (no ghost subscriptions)

### Notifications

- [ ] Bell badge shows correct unread count on page load (from `useUnreadNotificationCount`)
- [ ] Bell badge increments in real time when a new notification arrives (Realtime)
- [ ] Bell dropdown shows last 5 notifications with correct icons and timestamps
- [ ] `[Mark all]` in dropdown marks all read; badge drops to 0
- [ ] `/notifications` page shows all notifications, paginated
- [ ] Unread notifications have `bg-primary/5` background and blue dot
- [ ] Clicking a notification marks it read + navigates to `action_url` if set
- [ ] Filter tabs ("Unread", "Messages", "Grades", "Announcements") filter correctly
- [ ] `[Mark all as read]` on notifications page: all items update to read state; badge drops to 0
- [ ] Empty state renders when no notifications exist
- [ ] Notification count in bell is NOT shown when count is 0

### Global Search

- [ ] cmd+K (Mac) and Ctrl+K (Windows) open the search modal from any page
- [ ] Esc closes the modal
- [ ] Results update as user types (debounced 300ms — not on every keystroke)
- [ ] Results grouped: Courses, Lessons, People — each with a heading
- [ ] Keyboard navigation: arrow keys move between items; Enter opens the item
- [ ] Clicking a result: closes modal + navigates to correct URL
- [ ] Search query saved to recent searches in `localStorage` after selection
- [ ] Recent searches shown when query is empty
- [ ] No results state renders correctly for queries with no matches
- [ ] Minimum 2 characters before search fires (no results shown for single character)

---

## 19. IMPLEMENTATION ORDER

Follow this exact order. Each step depends on the previous:

```
1. Run Supabase SQL (Section 5) — all blocks in order:
   a. ALTER TABLE profiles (add new columns)
   b. Create message_threads table
   c. Create messages table
   d. Create messages Realtime publication + trigger
   e. Create notifications table
   f. Create avatars Storage bucket + policies
   g. Run seed data

2. Deploy send-notification Edge Function (Section 6)

3. Update grade-quiz Edge Function to call send-notification (Section 6)

4. Install new dependencies: cmdk, react-intersection-observer (Section 4)

5. Add new TypeScript types to src/lib/types.ts (Section 7)

6. Create new Zustand stores:
   a. Replace notificationStore.ts (Section 8.1)
   b. Create messageStore.ts (Section 8.2)

7. Create all query hooks (Section 9):
   a. useCurrentProfile.ts (replace/extend Phase 1 useProfile.ts)
   b. useUpdateProfile.ts + useUploadAvatar.ts + useChangePassword.ts
   c. useProgressAnalytics.ts
   d. useMessages.ts (threads + messages + mutations)
   e. useNotifications.ts (list + unread count + mutations)
   f. useSearch.ts

8. Create realtime hooks (Section 10):
   a. useMessageRealtime.ts
   b. useNotificationRealtime.ts
   c. usePresenceHeartbeat.ts

9. Mount realtime hooks in layouts:
   - Add useNotificationRealtime() to StudentLayout, InstructorLayout, AdminLayout
   - Add usePresenceHeartbeat() to all authenticated layouts
   - Add useUnreadNotificationCount() call to bootstrap the bell badge on layout mount

10. Update Topbar.tsx (Section 14):
    a. Wire GlobalSearchModal with cmd+K shortcut
    b. Replace bell stub with NotificationBell component
    c. Add messages badge from messageStore.totalUnread

11. Build shared components:
    a. OnlinePresenceDot.tsx
    b. EmptyNotificationsState.tsx
    c. EmptyThreadState.tsx

12. Build Profile components and pages:
    a. AvatarUploader.tsx — with drag-drop + preview + validation
    b. ProfileCard.tsx
    c. SocialLinksForm.tsx
    d. ProfileForm.tsx
    e. PasswordChangeForm.tsx
    f. NotificationPreferencesForm.tsx
    g. ProfilePage.tsx — wire all display components + useCurrentProfile
    h. ProfileEditPage.tsx — wire all form sections with their mutations
    i. Add /profile/edit route to App.tsx

13. Build Progress Analytics components and page:
    a. StatSummaryRow.tsx
    b. ScoreHistoryChart.tsx (Recharts LineChart)
    c. WeeklyActivityChart.tsx (Recharts BarChart)
    d. ActivityHeatmap.tsx (pure CSS grid)
    e. SkillBreakdownChart.tsx (Recharts RadarChart)
    f. CourseCompletionCard.tsx
    g. ProgressPage.tsx — wire all 5 sections with useProgressAnalytics

14. Build Messages components and page:
    a. MessageBubble.tsx
    b. MessageComposer.tsx
    c. ThreadListItem.tsx
    d. ThreadList.tsx (with MessageSearchBar)
    e. MessageThread.tsx (right panel: bubbles + composer + infinite scroll)
    f. NewMessageModal.tsx
    g. MessagesPage.tsx — split panel layout, reads :threadId from params
    h. Mount useMessageRealtime inside MessageThread component
    i. Update /messages and /messages/:threadId routes in App.tsx

15. Build Notification components and page:
    a. NotificationItem.tsx
    b. NotificationBell.tsx (replaces Phase 1 stub) — import in Topbar
    c. NotificationsPage.tsx — full list + filter tabs + mark all read
    d. Update /notifications route in App.tsx

16. Build Global Search:
    a. SearchResultItem.tsx
    b. SearchResultGroup.tsx
    c. GlobalSearchModal.tsx — uses cmdk, Dialog
    d. Mount in Topbar.tsx (import + render)

17. Add /profile/:userId route for public profiles (Section 15)

18. Bootstrap notification count on app load:
    - In each authenticated layout, mount useUnreadNotificationCount() hook
    - This sets the initial badge count from DB before any Realtime events arrive

19. Run all acceptance criteria (Section 18)
```

---

## 20. CRITICAL IMPLEMENTATION NOTES

1. **Realtime subscriptions MUST be cleaned up in `useEffect` return.** Every `supabase.channel(name).on(...).subscribe()` call must have a paired `return () => supabase.removeChannel(channel)`. Ghost subscriptions from unmounted components cause: (a) duplicate messages appearing, (b) stale closures updating old query keys, (c) memory leaks that accumulate over a session. This is the single most common production bug in Supabase Realtime apps.

2. **The Realtime payload on `postgres_changes` does NOT include join data.** When a new message arrives via `INSERT` on the `messages` table, `payload.new` contains only the raw `messages` row (no `sender` profile). Always re-fetch the full row with joins after receiving the event: `supabase.from('messages').select('*, sender:profiles(...)').eq('id', payload.new.id).single()`. Never try to construct the joined object manually from the payload — it will be incomplete.

3. **`message_threads` UNIQUE constraint normalization.** The `UNIQUE (LEAST(user_a_id::text), GREATEST(user_a_id::text))` approach means `useStartThread` must use `supabase.from(...).or(...)` to find an existing thread in BOTH directions before creating a new one. Do NOT assume that because you are `user_a_id` in the INSERT, you will always be `user_a_id` in a pre-existing thread — the thread might have been created by the other user first, making them `user_a_id`.

4. **Scroll position preservation in infinite message loading.** When `fetchNextPage()` loads older messages and prepends them above the current view, the scrollable container's `scrollTop` must be corrected. Before prepend: `const prevScrollHeight = container.scrollHeight`. After prepend: `container.scrollTop += container.scrollHeight - prevScrollHeight`. If you skip this, the view jumps to the top every time older messages load — this is one of the worst UX issues in chat UIs.

5. **Avatar upload: delete the old file before uploading new.** The `avatars` bucket is a public bucket, and Supabase Storage does not automatically deduplicate by filename when using `upsert: false`. If you don't delete old avatars, each user accumulates unlimited files in their folder. `useUploadAvatar` lists the user's folder and deletes existing files before uploading. This requires the "Users can delete own avatars" Storage policy.

6. **`useNotificationRealtime` must be mounted ONCE, not once per page.** Mount it at the layout level (inside `StudentLayout`, etc.), not inside `NotificationsPage` or `NotificationBell`. If it were mounted in `NotificationBell`, it would re-subscribe every time the bell popover opens and closes — creating duplicate subscriptions and duplicate badge increments.

7. **`GlobalSearchModal` with `cmdk` — do NOT use `Command`'s built-in filtering.** Set `shouldFilter={false}` on the `<Command>` element. Our `useSearch` hook handles filtering via Supabase queries. `cmdk`'s built-in filtering is client-side substring matching — it would re-filter the already-filtered Supabase results, producing wrong output. `shouldFilter={false}` disables this.

8. **Online presence is approximate, not real-time.** `last_seen_at` is updated every 5 minutes by `usePresenceHeartbeat`. This means a user who closed their tab will still appear "online" for up to 10 minutes. This is intentional — acceptable accuracy for an LMS. Do NOT implement a Supabase Presence (WebSocket heartbeat) system for Phase 4 — that's over-engineered for this use case. The 10-minute window is disclosed to users via tooltip text: "Last seen [relative time]" when offline.

9. **`ProfileEditPage` form sections save independently.** Do NOT wrap all 5 sections in one `<form>`. Each section has its own React Hook Form `<form>` element with its own submit handler and save button. This prevents a full-page form reset when one section fails validation. The avatar section has no traditional form element — it uses the file input + mutation pattern directly.

10. **`useProgressAnalytics` uses `Promise.all` for parallel queries — handle partial failures.** If one of the 5 parallel queries fails (e.g., `quiz_attempts` returns an error), the entire `Promise.all` rejects and the progress page shows an error state. Instead of `Promise.all`, use `Promise.allSettled` and handle each result individually, so a failing quiz query doesn't break the activity heatmap. Adjust the hook to use `allSettled` and fall back to `[]` for failed fetches.

11. **Notification preferences JSONB update requires merging, not replacing.** When a user toggles one switch, call `useUpdateProfile({ notification_preferences: { ...currentPrefs, [changedKey]: newValue } })`. Never send just `{ [changedKey]: newValue }` — Supabase `UPDATE` with a JSONB column replaces the entire JSON value, losing all other preference keys. Always spread the existing preferences before updating.

12. **The `/profile/:userId` public route must limit what data is shown.** When viewing another user's profile (not own), the following must be hidden: email address, notification preferences, payment history tab. The `ProfilePage` component checks `params.userId === user?.id` (or `params.userId === undefined` for `/profile`) to decide which view mode to render.

13. **Messages search in thread list is local filtering only — do NOT query Supabase.** The search bar in the thread list filters `threads` already loaded by `useMessageThreads`. It's a simple `.filter()` on the `other_user.full_name`. Since users typically have fewer than 50 active threads in an LMS, local filtering is instant and sufficient. No additional Supabase query needed. Pass the `search` string to `useMessageThreads` which already handles the filter locally (see the `filter((t) => ...)` at the end of the hook).

14. **`useUnreadNotificationCount` must be called on authenticated layout mount, not just on `/notifications` route.** The bell badge needs the count as soon as the user logs in. Mount `useUnreadNotificationCount()` in each authenticated layout component's body. TanStack Query will deduplicate the call — only one network request fires even if all 3 layouts mount the hook simultaneously.

15. **Message soft-delete does NOT remove the row.** When a user "deletes" a message, set `is_deleted = true`. The row stays in the DB and in the conversation for context — rendering as `[Message deleted]`. This is correct for a messaging audit trail and avoids breaking the conversation flow. The RLS `UPDATE` policy correctly restricts this to the message's own sender. Hard-delete (via `DELETE`) is not exposed to the UI in Phase 4.

---

*Phase 4 is complete when a student can: view and edit their full profile including uploading a real avatar stored in Supabase Storage; visit their Progress page and see live Recharts charts drawn from real quiz and lesson data; open the Messages page, send a message to an instructor, and see the reply appear without refreshing; see the notification bell badge increment in real time and view, filter, and clear notifications; and search the entire platform with cmd+K, navigating directly to a course, lesson, or instructor profile from the results.*
