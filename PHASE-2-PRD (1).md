# PHASE 2 PRD — EduFlow LMS
## Public Pages: Landing Page + Course Catalog + Course Detail

**Version**: 1.0  
**Depends on**: Phase 1 (auth, layouts, all route stubs, Supabase profiles table)  
**Goal**: Any visitor — authenticated or not — can browse the landing page, search and filter the full course catalog, view a detailed course page, and initiate enrollment. Every button has a destination. No dead ends.

---

## 1. OVERVIEW

Phase 2 makes EduFlow publicly accessible. Three fully-built pages replace the Phase 1 stubs:

| Route | Page | Auth required |
|-------|------|--------------|
| `/` | Landing Page | No |
| `/catalog` | Course Catalog | No |
| `/catalog/:courseId` | Course Detail | No (enrollment requires auth) |

All three pages pull real data from Supabase. The catalog is filterable, sortable, searchable, and paginated — with all state reflected in the URL so results are shareable. The course detail page has a sticky enrollment CTA that checks auth state and enrollment status before routing the user correctly.

---

## 2. DELIVERABLES CHECKLIST

- [ ] Supabase `courses` table created with RLS
- [ ] Supabase `modules` table created with RLS
- [ ] Supabase `lessons` table created with RLS
- [ ] Supabase `reviews` table created with RLS
- [ ] Supabase `enrollments` table created with RLS (partial — full use in Phase 3)
- [ ] Seed data: 10 published courses, 3–4 modules each, 4–8 lessons per module, 5 reviews per course
- [ ] Landing page — all 8 sections complete
- [ ] Landing page — every button navigates correctly
- [ ] Course Catalog — filter sidebar (6 filter types) working
- [ ] Course Catalog — search (debounced, URL param) working
- [ ] Course Catalog — sort dropdown (5 options) working
- [ ] Course Catalog — pagination working
- [ ] Course Catalog — all filter state reflected in URL params
- [ ] Course Catalog — filter state restored from URL on page load
- [ ] Course Catalog — filter panel responsive (sidebar desktop, drawer mobile)
- [ ] CourseCard component — all buttons navigate correctly
- [ ] Course Detail — hero section with all metadata
- [ ] Course Detail — sticky CTA card with correct enrollment logic
- [ ] Course Detail — curriculum accordion (all modules + lessons)
- [ ] Course Detail — instructor bio section
- [ ] Course Detail — reviews section with rating breakdown
- [ ] Course Detail — related courses section
- [ ] PaymentModal shell — opens on [Enroll Now] for paid courses
- [ ] Loading skeletons on all three pages
- [ ] Empty state on catalog (no results found)
- [ ] Error state on catalog + course detail
- [ ] SEO meta tags on all three pages
- [ ] Fully responsive on mobile, tablet, desktop

---

## 3. USER STORIES

### Visitor (unauthenticated)

| Story | Acceptance |
|-------|-----------|
| As a visitor, I want to see what EduFlow offers on the home page so I can decide to sign up | Landing page loads with hero, features, courses, pricing |
| As a visitor, I want to browse all available courses | Catalog shows all published courses |
| As a visitor, I want to filter courses by category, level, and price | Filters narrow results in real time |
| As a visitor, I want to search for a specific course by keyword | Search filters results as I type |
| As a visitor, I want to see full details about a course before deciding | Course detail page shows all info |
| As a visitor, I want to see the course curriculum before enrolling | Curriculum accordion shows all modules and lessons |
| As a visitor, I want to preview a lesson for free before paying | Free-preview lessons have a [Preview] button |
| As a visitor clicking [Enroll Now], I should be prompted to log in | Redirect to /login?redirect=back |

### Authenticated Student

| Story | Acceptance |
|-------|-----------|
| As a student, [Enroll Now] on a free course should immediately enroll me | Inserts into enrollments table → navigates to /learn/:courseId |
| As a student, [Enroll Now] on a paid course should open the payment modal | PaymentModal opens with course details |
| As a student already enrolled, the CTA shows [Continue Learning] | Checks enrollments table before rendering CTA |

---

## 4. PAGE 1 — LANDING PAGE (`/`)

### 4.1 Section 1 — Hero

**Layout**: Two-column on desktop (text left, visual right). Single column on mobile (text top, image bottom hidden on smallest mobile).

**Left column content**:
- Pre-badge: pill tag with sparkle icon → "🚀 Now with AI-Powered Tutoring"  
- Headline (H1, font-heading, text-5xl desktop / text-3xl mobile):  
  "Learn Without Limits. Grow Without Boundaries."  
- Subheadline (text-lg, text-muted-foreground, max-w-md):  
  "Access 200+ expert-led courses, earn certificates, and accelerate your career — all at your own pace."  
- CTA buttons (side by side on desktop, stacked on mobile):
  - Primary: `[Get Started Free →]` → `/signup`
  - Secondary (outline): `[Browse Courses]` → `/catalog`
- Social proof row below CTAs: avatars of 5 students (overlapping circles) + "Join 12,000+ learners"

**Right column**: 
- An SVG or Lottie-style illustration showing a dashboard mockup or student studying with laptop. If no external asset available, use an abstract geometric SVG with primary color shapes.
- Floating stats cards around the illustration:
  - Top-right: "4.9★ Average Rating"
  - Bottom-left: "200+ Courses"

**Background**: Subtle gradient from white to primary-light (EEF2FF) across the hero section, not the whole page.

---

### 4.2 Section 2 — Stats Bar

Full-width band, light gray background (`bg-muted/30`), `py-8`.

Four stats side by side (2×2 grid on mobile):

| Icon | Number | Label |
|------|--------|-------|
| Users icon | 12,000+ | Students Enrolled |
| BookOpen icon | 200+ | Expert Courses |
| Award icon | 8,500+ | Certificates Issued |
| Star icon | 4.9/5 | Average Rating |

Numbers use `font-heading text-3xl font-bold text-primary`. Labels use `text-sm text-muted-foreground`. Each stat separated by a vertical divider (hidden on mobile).

---

### 4.3 Section 3 — Features

**Heading**: "Everything You Need to Succeed"  
**Subheading**: "Built for learners who are serious about growth"

Four feature cards in a 2×2 grid (desktop) / 1 column (mobile):

| Icon | Title | Description |
|------|-------|-------------|
| Zap | Learn at Your Pace | Lifetime access to all enrolled courses. Watch, pause, rewind — on any device. |
| Users | Expert Instructors | Learn from industry professionals with years of real-world experience. |
| FileCheck | Verified Certificates | Earn shareable certificates recognized by top companies worldwide. |
| Bot | AI Tutor 24/7 | Ask questions any time. Our AI tutor explains concepts specific to your course. |

Card style: white, rounded-xl, shadow-card, p-6. Icon in a primary-light circle (48×48). Title: text-lg font-semibold. Description: text-sm text-muted-foreground.

---

### 4.4 Section 4 — Featured Courses

**Heading**: "Our Most Popular Courses"  
**Subheading**: "Thousands of students are learning these right now"

- Pull 6 courses from Supabase: `SELECT ... ORDER BY enrollment_count DESC LIMIT 6` (published only)
- Display as a 3-column grid (desktop) / 2-column (tablet) / 1-column (mobile)
- Use the shared `<CourseCard />` component (see Section 8)
- Loading state: 6 `<CourseCardSkeleton />` placeholders

**Bottom**: Centered `[View All Courses →]` button (outline) → `/catalog`

---

### 4.5 Section 5 — How It Works

**Heading**: "Start Learning in 3 Simple Steps"

Three numbered steps, horizontally connected by a dashed line on desktop (stacked on mobile):

| Number | Title | Description | Icon |
|--------|-------|-------------|------|
| 1 | Browse & Choose | Explore 200+ courses across 6 categories. Filter by skill level and price. | Search |
| 2 | Enroll & Learn | Watch HD lessons, read materials, take quizzes — all in one place. | Play |
| 3 | Earn & Grow | Complete courses, earn certificates, and advance your career. | Award |

Step number: large bold text in primary color (48px). Title: text-xl font-semibold. Connector line: `border-t-2 border-dashed border-primary/30` on desktop.

---

### 4.6 Section 6 — Testimonials

**Heading**: "Loved by Learners Worldwide"

Three testimonial cards in a row (desktop) / carousel or stacked (mobile):

Each card contains:
- 5-star rating display (solid amber stars)
- Quote text in italics (2–3 lines, ~80 words)
- Author: avatar circle (initials) + name + role/company
- Card style: white, rounded-xl, shadow-card, p-6, border border-border

Hard-code 3 realistic testimonials in the component (not from DB).

**Sample testimonials**:
> "EduFlow transformed my career. I went from zero Python knowledge to landing a data analyst job in 4 months. The AI tutor feature is a game-changer."  
> — Priya S., Data Analyst at Infosys

> "The course quality is incredible. Well-structured, practical, and the instructor actually responds to forum questions. Worth every rupee."  
> — Arjun M., Full-Stack Developer

> "I earned my first certificate in UI/UX and immediately used it to get a freelance project. EduFlow pays for itself."  
> — Sneha R., Freelance Designer

---

### 4.7 Section 7 — Pricing

**Heading**: "Simple, Transparent Pricing"  
**Subheading**: "Start free. Upgrade when you're ready."

**Anchor**: `id="pricing"` on this section (for the navbar "Pricing" link).

Three pricing tiers in a row (desktop) / stacked (mobile):

**Tier 1 — Free**  
Price: ₹0/month  
Badge: none  
Features:
- ✓ Access to 50+ free courses
- ✓ Community forum access
- ✓ Progress tracking
- ✗ Certificates
- ✗ AI Tutor
- ✗ Premium courses  
CTA: `[Get Started Free]` → `/signup` (secondary/outline button)

**Tier 2 — Pro** *(highlighted — "Most Popular" badge)*  
Price: ₹599/month  
Badge: "Most Popular" in primary color  
Card: border-2 border-primary, shadow-xl (elevated)  
Features:
- ✓ Access to all 200+ courses
- ✓ All certificates included
- ✓ AI Tutor (unlimited)
- ✓ Offline downloads
- ✓ Priority support
- ✓ Community forum  
CTA: `[Start Pro Free — 7 Days]` → `/signup?plan=pro` (primary button)

**Tier 3 — Enterprise**  
Price: Custom  
Features:
- ✓ Everything in Pro
- ✓ Team management dashboard
- ✓ Custom branding
- ✓ SSO & SCIM
- ✓ Dedicated account manager
- ✓ SLA guarantee  
CTA: `[Contact Sales]` → `mailto:sales@eduflow.app` (secondary button)

Annual toggle above the cards: `[Monthly]` / `[Annual — Save 20%]`. When "Annual" is active, Pro price shows ₹479/month (struck-through monthly price). This is UI-only toggle, no DB call.

---

### 4.8 Section 8 — Final CTA Banner

Full-width section, `bg-primary` background, white text.

- Headline: "Ready to Start Learning Today?"
- Subheadline: "Join 12,000+ students already on EduFlow. Your first course is on us."
- Two buttons (stacked centered):
  - `[Create Free Account]` → `/signup` (white button with primary text)
  - `[Browse Courses]` → `/catalog` (outline white button)

---

## 5. PAGE 2 — COURSE CATALOG (`/catalog`)

### 5.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  PublicNavbar                                                   │
├────────────────────────────────────────────────────────────────┤
│  Page header: "Course Catalog"  [subtitle: X courses available]│
├────────────────────────────────────────────────────────────────┤
│  Search bar (full width, centered, below header)               │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────────────────────────┐ │
│  │              │  │  [Sort dropdown]  [X results]  [Filter] │ │
│  │ FilterPanel  │  ├─────────────────────────────────────────┤ │
│  │  (desktop    │  │  ┌──────┐  ┌──────┐  ┌──────┐          │ │
│  │   sidebar)   │  │  │Card  │  │Card  │  │Card  │          │ │
│  │              │  │  └──────┘  └──────┘  └──────┘          │ │
│  │              │  │  ┌──────┐  ┌──────┐  ┌──────┐          │ │
│  │              │  │  │Card  │  │Card  │  │Card  │          │ │
│  │              │  │  └──────┘  └──────┘  └──────┘          │ │
│  └──────────────┘  │  ┌──────────── Pagination ───────────┐  │ │
│                    │  └────────────────────────────────────┘  │ │
│                    └─────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  PublicFooter                                                   │
└─────────────────────────────────────────────────────────────────┘
```

Mobile layout: No sidebar. Instead, a sticky bar below the search: `[Filters (3)]` button (opens filter drawer) and `[Sort]` button. Filter drawer slides from left as a Sheet component.

---

### 5.2 Search Bar

- Position: below the page header, above the filter + grid row
- Width: max-w-2xl, centered
- Placeholder: "Search for courses, skills, or topics…"
- Search icon inside input (left side)
- [X] clear button (right side, visible when input has value)
- Behavior:
  - Debounced: 400ms after user stops typing → updates `?q=` URL param → triggers query
  - On Enter: same as typing but immediate
  - On [X] click: clears input, removes `?q=` from URL, resets to all courses
- Active search shows a "Showing results for '{term}'" tag below the bar with [×] to clear

---

### 5.3 Filter Panel — Detailed Spec

**Filter section 1 — Category** (CheckboxGroup, multi-select)
```
□ Programming      (48)
□ Design           (32)
□ Business         (27)
□ Marketing        (19)
□ Data Science     (24)
□ Other            (12)
```
Numbers in parentheses are course counts per category. Selecting multiple categories → OR logic (show courses in ANY selected category).

**Filter section 2 — Level** (CheckboxGroup, multi-select)
```
□ Beginner         (62)
□ Intermediate     (54)
□ Advanced         (46)
```

**Filter section 3 — Price** (RadioGroup, single-select)
```
○ All prices
○ Free
○ Paid
○ Under ₹500
○ ₹500 – ₹2,000
○ ₹2,000+
```

**Filter section 4 — Rating** (RadioGroup, single-select)
```
○ Any rating
○ ⭐ 4.5 & above
○ ⭐ 4.0 & above
○ ⭐ 3.5 & above
```

**Filter section 5 — Duration** (CheckboxGroup, multi-select)
```
□ Under 2 hours
□ 2 – 5 hours
□ 5 – 10 hours
□ 10+ hours
```

**Filter section 6 — Language** (CheckboxGroup, multi-select)
```
□ English
□ Hindi
□ Kannada
```

**Filter panel controls**:
- Section headers are collapsible (Accordion behavior, default expanded)
- `[Clear All Filters]` button at top of filter panel (only visible when any filter is active) — resets all filters + removes URL params
- Active filter count badge on the `[Filters]` mobile button: e.g. "Filters (3)"

---

### 5.4 Sort Dropdown

Positioned: top-right of the results area.  
Label: "Sort by:" with selected value.

Options:
- Most Popular (default — `ORDER BY enrollment_count DESC`)
- Newest (`ORDER BY published_at DESC`)
- Highest Rated (`ORDER BY rating DESC`)
- Price: Low to High (`ORDER BY price ASC`)
- Price: High to Low (`ORDER BY price DESC`)

---

### 5.5 Active Filters Display

When any filter is active, show a row of filter tags below the search bar:

```
Active filters:  [Programming ×]  [Beginner ×]  [Free ×]    [Clear all]
```

Each tag: small pill with the filter value and an [×] to remove that specific filter. Clicking [×] removes just that filter from URL params. [Clear all] removes all.

---

### 5.6 Results Summary

Text above the grid: `"Showing 1–12 of 48 courses"`. Updates in real time with filters.

---

### 5.7 CourseCard Component

Reused on both the catalog page and the landing page.

```
┌────────────────────────────────┐
│  [Thumbnail image 16:9 ratio]  │  height: 160px, object-cover
│  [Category badge overlay TL]   │  top-left absolute
├────────────────────────────────┤
│  ⭐ 4.8  (2,847 ratings)       │  rating + count
│  [Card title — 2 lines max]    │  font-semibold text-base
│  [Instructor name]             │  text-sm text-muted
├────────────────────────────────┤
│  [Level badge] [Duration]      │  meta row
├────────────────────────────────┤
│  ₹2,999    ~~₹5,999~~          │  price + original
│  [View Course →]               │  full-width button
└────────────────────────────────┘
```

**Hover state**: `shadow-md`, thumbnail scales slightly (`scale-105` with `overflow-hidden`), transition-all duration-200.

**Free course**: Price area shows "Free" in green instead of a price.

**Badge colors by category**:
- Programming: blue
- Design: purple
- Business: green
- Marketing: orange
- Data Science: indigo
- Other: gray

**[View Course →] button**: navigates to `/catalog/:courseId`.

**Entire card is also clickable** (not just the button) — cursor: pointer, navigates to detail page.

---

### 5.8 Pagination

- 12 courses per page (PAGE_SIZE = 12)
- Shows page numbers: `← Previous  1  2  3 ... 8  Next →`
- Current page: filled primary button style
- On click: updates `?page=` URL param and scrolls window to top
- If total ≤ 12: no pagination shown

---

### 5.9 Empty State

When no courses match the active filters:

```
       🔍
  No courses found
  
  Try adjusting your filters or search term.
  
  [Clear all filters]
```

---

### 5.10 Loading State

While fetching: render 12 `<CourseCardSkeleton />` components in the grid. Skeleton matches the exact shape of CourseCard with animated pulse.

---

## 6. PAGE 3 — COURSE DETAIL (`/catalog/:courseId`)

### 6.1 Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  PublicNavbar                                                    │
├──────────────────────────────────────────────────────────────────┤
│  Hero: dark bg (slate-900), breadcrumb, title, meta             │
├──────────────────────────────────┬───────────────────────────────┤
│                                  │                               │
│  ┌──────────────────────────┐    │  ┌─────────────────────────┐ │
│  │ What You'll Learn        │    │  │   Sticky CTA Card       │ │
│  │ Requirements             │    │  │   (thumbnail + price +  │ │
│  │ Curriculum Accordion     │    │  │    enroll button)       │ │
│  │ Instructor Bio           │    │  └─────────────────────────┘ │
│  │ Reviews Section          │    │                               │
│  │ Related Courses          │    │   (sticks when scrolling)     │
│  └──────────────────────────┘    │                               │
├──────────────────────────────────┴───────────────────────────────┤
│  PublicFooter                                                    │
└──────────────────────────────────────────────────────────────────┘
```

Left column: `col-span-8` (desktop), full width (mobile/tablet)  
Right column: `col-span-4` (desktop), hidden (mobile) — mobile CTA shown inside hero section

---

### 6.2 Hero Section

Background: `bg-slate-900` (dark regardless of page theme), white text.

**Breadcrumb** (small, above title):  
`Home > Catalog > [Category] > [Course Title]`  
Each item is a link (Home → /, Catalog → /catalog, Category → /catalog?category=X)

**Content**:
- Course title: `font-heading text-4xl font-bold text-white`
- Short description: `text-lg text-slate-300` (max 2 lines)
- Rating row: `⭐ 4.8` (amber) + `(2,847 ratings)` + `|` + `18,420 students`
- Meta row: `Last updated Feb 2024` + `|` + `English` + `|` + `Certificate included`
- Instructor row: `Created by` + instructor avatar (small) + instructor name (link → jumps to instructor section)

**Mobile CTA button** (only visible below md): Full-width `[Enroll Now]` button shown inside the hero, below the meta. This is the only CTA visible on mobile.

---

### 6.3 Sticky CTA Card (desktop only)

```
┌────────────────────────────────┐
│  [Course thumbnail 16:9]       │
├────────────────────────────────┤
│  ₹2,999                        │  text-3xl font-bold
│  ~~₹5,999~~  50% off           │  text-muted, strike + discount badge
│  ⏰ 2 days left at this price  │  urgency text (amber, optional)
├────────────────────────────────┤
│  [Enroll Now]                  │  full width primary button, large
│  [Try Preview]  (if available) │  full width ghost/outline button
├────────────────────────────────┤
│  ✓ Full lifetime access        │
│  ✓ Access on mobile & desktop  │
│  ✓ Certificate on completion   │
│  ✓ AI Tutor included           │
├────────────────────────────────┤
│  [Share] [Gift this course]    │  icon buttons
└────────────────────────────────┘
```

**Sticky behavior**: `position: sticky; top: 80px` (just below topbar). Card stays visible while scrolling through the left column content.

**[Enroll Now] button logic** (4 cases — implement exactly as described):

| Case | Condition | Button text | Behavior |
|------|-----------|-------------|----------|
| 1 | Not authenticated | Enroll Now | `navigate('/login?redirect=/catalog/' + courseId)` |
| 2 | Authenticated + free course + not enrolled | Enroll Now — Free | `INSERT INTO enrollments` → `navigate('/learn/' + courseId)` |
| 3 | Authenticated + paid course + not enrolled | Enroll Now — ₹X,XXX | Open `<PaymentModal />` |
| 4 | Authenticated + already enrolled | Continue Learning | `navigate('/learn/' + courseId)` |

Loading state while checking enrollment: button shows spinner.

---

### 6.4 What You'll Learn Section

Two-column grid of checkmarked items:
```
✓ Build full-stack apps with React     ✓ Write clean, maintainable TypeScript
✓ Use Supabase for auth & database     ✓ Deploy to Vercel in minutes
✓ Master state management with Zustand ✓ Handle real-time data with Supabase
```

Icon: green `Check` icon (Lucide). Max 8–12 items pulled from `course.what_you_learn[]`.

---

### 6.5 Requirements Section

Bulleted list: `course.requirements[]`.

---

### 6.6 Curriculum Accordion

Each module is an Accordion item:

```
▼ Module 1 — Getting Started (4 lessons · 45 min)
  ├─ 📹 Introduction to the Course    5 min   [Free Preview]
  ├─ 📹 Setting Up Your Environment  12 min   [Locked 🔒]
  ├─ 📄 Course Resources              —       [Locked 🔒]
  └─ ❓ Module 1 Quiz                  —       [Locked 🔒]

▶ Module 2 — Core Concepts (6 lessons · 1h 20min)
▶ Module 3 — Advanced Topics (8 lessons · 2h 15min)
```

**Module header**: expand/collapse on click. Shows module title + lesson count + total duration.

**Lesson row**:
- Type icon: 📹 video / 📄 PDF / 📝 text / ❓ quiz / 📋 assignment
- Lesson title
- Duration (right-aligned)
- If `is_free_preview = true`: `[Preview]` button (text, primary color) → navigates to `/learn/:courseId/lesson/:lessonId`
- If not free preview and user not enrolled: `🔒` icon (gray, not clickable)
- If user is enrolled: clickable → `/learn/:courseId/lesson/:lessonId`

First module: expanded by default. Others: collapsed.

---

### 6.7 Instructor Bio Section

```
┌─────────────────────────────────────────────────────┐
│  [Avatar 80px]  Instructor Name                     │
│                 Title / Role (e.g., "Senior Dev at  │
│                 Infosys, 10+ years experience")      │
│                 ⭐ 4.9  👥 8,420 students  📚 12 courses │
├─────────────────────────────────────────────────────┤
│  Bio paragraph (2–3 sentences from profile.bio)     │
└─────────────────────────────────────────────────────┘
```

---

### 6.8 Reviews Section

**Overall rating display**:
```
     4.8 ★★★★★             ████████████░  5 stars (68%)
  ──────────────          ████████░░░░░  4 stars (22%)
  "Outstanding"           ████░░░░░░░░░  3 stars (6%)
  Based on 2,847 ratings  ██░░░░░░░░░░░  2 stars (3%)
                          █░░░░░░░░░░░░  1 star  (1%)
```

Progress bars are `bg-primary` filled. Percentages calculated from actual review data.

**Individual review cards** (show first 8, [Load More] button fetches next 8):

```
[Avatar] Arjun M.           ⭐⭐⭐⭐⭐     3 weeks ago
[Review title in bold]
[Review body text — 2–4 lines]
[X people found this helpful] [Helpful]
```

---

### 6.9 Related Courses

**Heading**: "Students Also Viewed"

3-course horizontal row (scroll on mobile). Shows courses in the same category, excluding the current course. Uses `<CourseCard />` component.

---

## 7. PAYMENTMODAL SHELL

File: `src/components/modals/PaymentModal.tsx`

```typescript
interface PaymentModalProps {
  isOpen:    boolean
  onClose:   () => void
  course:    Pick<Course, 'id' | 'title' | 'price' | 'thumbnail_url'>
}
```

**Modal content** (Phase 2 shell — real Razorpay in Phase 9):

```
┌────────────────────────────────────────────┐
│  Complete Your Enrollment                  │
├────────────────────────────────────────────┤
│  [thumbnail 80px] Course title             │
│                   ₹2,999                   │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │
│  │  💳 Payment integration coming soon  │  │
│  │                                      │  │
│  │  Razorpay checkout will appear here  │  │
│  │  in Phase 9.                         │  │
│  └──────────────────────────────────────┘  │
├────────────────────────────────────────────┤
│  [Cancel]              [Proceed to Pay →]  │
│                         (disabled + tooltip│
│                          "Coming in Phase 9"│
└────────────────────────────────────────────┘
```

The modal is rendered in a React Portal (`document.body`) to avoid z-index issues. Closing: [Cancel] button or clicking the backdrop or pressing Escape.

---

## 8. NEW SHARED COMPONENTS IN PHASE 2

| Component | File | Used in |
|-----------|------|---------|
| `CourseCard` | `src/components/courses/CourseCard.tsx` | Landing, Catalog |
| `CourseCardSkeleton` | `src/components/courses/CourseCardSkeleton.tsx` | Landing, Catalog |
| `FilterPanel` | `src/components/courses/FilterPanel.tsx` | Catalog |
| `FilterDrawer` | `src/components/courses/FilterDrawer.tsx` | Catalog (mobile) |
| `ActiveFilters` | `src/components/courses/ActiveFilters.tsx` | Catalog |
| `SortDropdown` | `src/components/courses/SortDropdown.tsx` | Catalog |
| `Pagination` | `src/components/common/Pagination.tsx` | Catalog |
| `StarRating` | `src/components/common/StarRating.tsx` | CourseCard, Detail |
| `PriceBadge` | `src/components/courses/PriceBadge.tsx` | CourseCard, Detail |
| `CourseMeta` | `src/components/courses/CourseMeta.tsx` | CourseCard, Detail |
| `CurriculumAccordion` | `src/components/courses/CurriculumAccordion.tsx` | Detail |
| `RatingBreakdown` | `src/components/courses/RatingBreakdown.tsx` | Detail |
| `ReviewCard` | `src/components/courses/ReviewCard.tsx` | Detail |
| `InstructorBio` | `src/components/courses/InstructorBio.tsx` | Detail |
| `PaymentModal` | `src/components/modals/PaymentModal.tsx` | Detail |

---

## 9. NAVIGATION FLOWS

### 9.1 Visitor to Enrollment

```
/ (landing)
  → [Get Started Free] → /signup
  → [Browse Courses] → /catalog
  → [View Course] on featured card → /catalog/:courseId
  → [Enroll Now] on detail (not authed) → /login?redirect=/catalog/:id
  → login success → back to /catalog/:id
  → [Enroll Now] again (now authed, free course) → INSERT enrollment → /learn/:id

/catalog
  → filter / sort / search → same page, URL params updated
  → [View Course] on card → /catalog/:courseId
  → paginate → same page, ?page= updated

/catalog/:courseId
  → [Enroll Now] → (see logic above)
  → instructor name (anchor link) → scrolls to instructor section
  → [Preview] on free lesson → /learn/:courseId/lesson/:lessonId
  → related course card → /catalog/:otherCourseId
  → breadcrumb category → /catalog?category=X
```

---

## 10. RESPONSIVE BEHAVIOR SUMMARY

| Element | Mobile (<768px) | Tablet (768–1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Hero layout | Single column | Single column | Two columns |
| Stats bar | 2×2 grid | 4 in a row | 4 in a row |
| Features grid | 1 column | 2×2 | 2×2 |
| Featured courses | 1 column | 2 columns | 3 columns |
| Testimonials | Stacked | 3 columns | 3 columns |
| Pricing tiers | Stacked | Stacked | 3 columns |
| Catalog layout | No sidebar, filter drawer | No sidebar, filter drawer | Sidebar + grid |
| Course grid | 1 column | 2 columns | 3 columns |
| CTA card | Hidden (hero CTA instead) | Hidden (hero CTA instead) | Sticky right column |
| Curriculum | Full width | Full width | Left column |
| Reviews | Full width | Full width | Left column |

---

## 11. SEO META TAGS

Use `react-helmet-async`. Install: `npm install react-helmet-async`.

Add `<HelmetProvider>` to `main.tsx`.

**Landing page** (`/`):
```html
<title>EduFlow LMS — Learn Skills. Earn Certificates. Grow Your Career.</title>
<meta name="description" content="Access 200+ expert courses on programming, design, business, and more. Learn at your own pace with AI-powered tutoring." />
<meta property="og:title" content="EduFlow LMS" />
<meta property="og:type" content="website" />
```

**Catalog page** (`/catalog`):
```html
<title>Browse Courses — EduFlow LMS</title>
<meta name="description" content="Browse 200+ courses on programming, design, business, and data science. Filter by category, level, and price." />
```

**Course detail** (`/catalog/:courseId`):
```html
<title>{course.title} — EduFlow LMS</title>
<meta name="description" content={course.short_description} />
<meta property="og:image" content={course.thumbnail_url} />
```

---

## 12. LOADING + ERROR STATES (per page)

### Landing page
- Featured courses section: 6 `<CourseCardSkeleton />` while fetching
- If fetch fails: show "Couldn't load courses. [Retry]" in the featured section
- Other sections: all static content, no loading states needed

### Catalog page
- Initial load: 12 `<CourseCardSkeleton />` in the grid
- Filter change: skeleton replaces grid immediately (don't keep stale results visible)
- Fetch error: full-page error state (see `<ErrorState />` component)

### Course detail page
- Full page skeleton while fetching (title bar, two-column layout)
- Curriculum: skeleton accordions (3 collapsed rows)
- Reviews: 3 `<ReviewCardSkeleton />` items
- Course not found (404 from Supabase): redirect to `/404`
- Course not published / draft: redirect to `/404`

---

## 13. ACCEPTANCE CRITERIA

### Landing Page
- [ ] All 8 sections render with correct content
- [ ] [Get Started Free] navigates to /signup
- [ ] [Browse Courses] navigates to /catalog
- [ ] [View All Courses] in featured section navigates to /catalog
- [ ] Featured courses load from Supabase (not hardcoded)
- [ ] Annual/monthly toggle on pricing changes Pro price
- [ ] #pricing anchor works from navbar "Pricing" link
- [ ] Pricing [Get Started] buttons navigate to /signup
- [ ] Final CTA buttons navigate correctly
- [ ] Fully responsive (all 3 breakpoints verified)
- [ ] Dark mode: all sections adapt correctly

### Catalog Page
- [ ] On load: all published courses shown, 12 per page
- [ ] Typing in search updates `?q=` in URL and filters results (400ms debounce)
- [ ] Selecting a category filter updates `?category=` in URL and filters results
- [ ] Multiple category filters use OR logic
- [ ] Clearing a filter updates URL and reloads
- [ ] [Clear All Filters] resets all URL params and shows all courses
- [ ] Active filter tags display correctly with [×] per filter
- [ ] Sort dropdown changes `?sort=` URL param and re-queries
- [ ] Pagination shows correct page, updates URL, scrolls to top
- [ ] Results count ("Showing X–Y of Z") is accurate
- [ ] Filter state fully restored from URL on hard refresh (no state loss)
- [ ] Mobile: [Filters] button opens drawer, filters work identically
- [ ] Empty state appears when no courses match filters
- [ ] Loading skeletons appear on every fetch

### Course Detail Page
- [ ] All course metadata displayed correctly
- [ ] Curriculum shows all modules, all lessons with correct icons and duration
- [ ] First module expanded, others collapsed
- [ ] Free preview lessons have a working [Preview] button
- [ ] [Enroll Now] case 1: unauthenticated → redirects to login with redirect param
- [ ] [Enroll Now] case 2: free course + authenticated → inserts enrollment → navigates to /learn/:id
- [ ] [Enroll Now] case 3: paid course + authenticated → opens PaymentModal
- [ ] [Enroll Now] case 4: already enrolled → shows [Continue Learning] → navigates to /learn/:id
- [ ] Sticky CTA card sticks on desktop scroll
- [ ] Mobile: sticky card hidden, inline CTA in hero visible
- [ ] Rating breakdown percentages are correct
- [ ] Reviews load with [Load More] showing next 8
- [ ] Related courses section shows 3 courses in same category
- [ ] PaymentModal opens and closes correctly

---

*Phase 2 is complete when a visitor can arrive at the landing page, browse the catalog with full filtering, view any course in detail, and be correctly routed through the enrollment flow based on their auth state.*
