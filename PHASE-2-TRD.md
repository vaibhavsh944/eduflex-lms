# PHASE 2 TRD — EduFlow LMS
## Technical Requirements: Public Pages, Course Catalog, Course Detail

**Version**: 1.0  
**Depends on**: Phase 1 TRD + Phase 1 implementation complete  
**Engineer reference**: This document is the single source of truth for every implementation decision in Phase 2. If something isn't covered here, it should be asked before coding begins.

---

## 1. NEW FILE ADDITIONS TO PROJECT STRUCTURE

Add these files to the Phase 1 project. Do not modify any Phase 1 file unless explicitly stated.

```
src/
├── hooks/
│   ├── queries/
│   │   ├── useCourses.ts              # Catalog query with filters
│   │   ├── useCourse.ts               # Single course detail query
│   │   ├── useFeaturedCourses.ts      # Landing page top courses
│   │   ├── useEnrollmentStatus.ts     # Check if user is enrolled in a course
│   │   └── useCourseReviews.ts        # Paginated course reviews
│   └── useFilterState.ts              # URL param ↔ filter state sync
│
├── components/
│   ├── courses/
│   │   ├── CourseCard.tsx
│   │   ├── CourseCardSkeleton.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── FilterDrawer.tsx
│   │   ├── ActiveFilters.tsx
│   │   ├── SortDropdown.tsx
│   │   ├── CurriculumAccordion.tsx
│   │   ├── RatingBreakdown.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewCardSkeleton.tsx
│   │   └── InstructorBio.tsx
│   │
│   ├── common/
│   │   ├── Pagination.tsx             # (new — add to Phase 1 common/)
│   │   ├── StarRating.tsx             # (new)
│   │   └── PriceBadge.tsx             # (new)
│   │
│   └── modals/
│       └── PaymentModal.tsx
│
└── pages/
    └── public/
        ├── LandingPage.tsx            # Replace Phase 1 stub
        ├── CatalogPage.tsx            # Replace Phase 1 stub
        └── CourseDetailPage.tsx       # Replace Phase 1 stub
```

---

## 2. DATABASE SCHEMA — SUPABASE SQL

Run all of the following SQL blocks in the Supabase SQL Editor **in order**. Each block depends on the previous.

### 2.1 Install the `react-helmet-async` package (do this first)

```bash
npm install react-helmet-async
```

### 2.2 Courses Table

```sql
CREATE TABLE public.courses (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title             TEXT        NOT NULL,
  slug              TEXT        NOT NULL UNIQUE,
  description       TEXT        NOT NULL,
  short_description TEXT,
  thumbnail_url     TEXT,
  preview_video_url TEXT,
  instructor_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  category          TEXT        NOT NULL
                                CHECK (category IN (
                                  'programming','design','business',
                                  'marketing','data-science','other'
                                )),
  level             TEXT        NOT NULL
                                CHECK (level IN ('beginner','intermediate','advanced')),
  pricing_type      TEXT        NOT NULL DEFAULT 'free'
                                CHECK (pricing_type IN ('free','paid','subscription')),
  price             DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price    DECIMAL(10,2),
  status            TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft','published','archived')),
  tags              TEXT[]      DEFAULT '{}',
  duration_minutes  INTEGER     NOT NULL DEFAULT 0,
  lesson_count      INTEGER     NOT NULL DEFAULT 0,
  enrollment_count  INTEGER     NOT NULL DEFAULT 0,
  rating            DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count      INTEGER     NOT NULL DEFAULT 0,
  what_you_learn    TEXT[]      DEFAULT '{}',
  requirements      TEXT[]      DEFAULT '{}',
  language          TEXT        NOT NULL DEFAULT 'English',
  certificate       BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ
);

-- updated_at trigger
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Anyone can read published courses (unauthenticated included)
CREATE POLICY "Published courses are publicly readable"
  ON public.courses FOR SELECT
  USING (status = 'published');

-- Instructors can read their own draft/archived courses
CREATE POLICY "Instructors can read own courses"
  ON public.courses FOR SELECT
  USING (
    instructor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor','admin'))
  );

-- Instructors can insert new courses
CREATE POLICY "Instructors can create courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    instructor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('instructor','admin'))
  );

-- Instructors can update own courses; admins can update any
CREATE POLICY "Instructors can update own courses"
  ON public.courses FOR UPDATE
  USING (
    instructor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete courses
CREATE POLICY "Admins can delete courses"
  ON public.courses FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 2.3 Modules Table

```sql
CREATE TABLE public.modules (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id   UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  order_index INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Public read if course is published
CREATE POLICY "Modules readable if course is published"
  ON public.modules FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM courses WHERE id = modules.course_id AND status = 'published')
  );

-- Instructor/admin write
CREATE POLICY "Instructor can manage modules of own courses"
  ON public.modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = modules.course_id
        AND (instructor_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );
```

### 2.4 Lessons Table

```sql
CREATE TABLE public.lessons (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id        UUID        NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  course_id        UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  type             TEXT        NOT NULL
                               CHECK (type IN ('video','pdf','text','quiz','assignment')),
  content_url      TEXT,
  content_text     TEXT,
  duration_minutes INTEGER     NOT NULL DEFAULT 0,
  order_index      INTEGER     NOT NULL DEFAULT 0,
  is_free_preview  BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Free preview lessons: publicly readable
CREATE POLICY "Free preview lessons are publicly readable"
  ON public.lessons FOR SELECT
  USING (is_free_preview = true);

-- Non-preview lessons: readable if enrolled
CREATE POLICY "Enrolled students can read all lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE course_id = lessons.course_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Instructor can read own course lessons (for management)
CREATE POLICY "Instructor can read own course lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = lessons.course_id
        AND (instructor_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Instructor/admin write
CREATE POLICY "Instructor can manage own course lessons"
  ON public.lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = lessons.course_id
        AND (instructor_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );
```

### 2.5 Enrollments Table

```sql
CREATE TABLE public.enrollments (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id    UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','completed','dropped')),
  progress     INTEGER     NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Students can see their own enrollments
CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (user_id = auth.uid());

-- Students can create enrollments (for free courses — paid via Edge Function in Phase 9)
CREATE POLICY "Authenticated users can enroll in free courses"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM courses WHERE id = course_id AND pricing_type = 'free')
  );

-- Instructors can see enrollments in their own courses
CREATE POLICY "Instructors can view enrollments in own courses"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = enrollments.course_id
        AND instructor_id = auth.uid()
    )
  );

-- Admins can see all
CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 2.6 Reviews Table

```sql
CREATE TABLE public.reviews (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id     UUID        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating        INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         TEXT,
  body          TEXT        NOT NULL,
  helpful_count INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews on published courses are publicly readable
CREATE POLICY "Reviews on published courses are publicly readable"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM courses WHERE id = reviews.course_id AND status = 'published')
  );

-- Enrolled students can post reviews
CREATE POLICY "Enrolled students can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE course_id = reviews.course_id AND user_id = auth.uid()
    )
  );

-- Users can update/delete their own reviews
CREATE POLICY "Users can manage own reviews"
  ON public.reviews FOR ALL
  USING (user_id = auth.uid());
```

### 2.7 Enrollment count trigger (keeps courses.enrollment_count in sync)

```sql
CREATE OR REPLACE FUNCTION public.update_enrollment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE courses
    SET enrollment_count = enrollment_count + 1
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE courses
    SET enrollment_count = GREATEST(0, enrollment_count - 1)
    WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_enrollment_change
  AFTER INSERT OR DELETE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_count();
```

---

## 3. SEED DATA — SQL

Run in Supabase SQL Editor after tables are created.

```sql
-- ── INSTRUCTOR PROFILES ─────────────────────────────────────────────────────
-- Note: these must be real Supabase auth users. Create them via Supabase Auth
-- dashboard or via the signup page first, then run this UPDATE to set their role.
-- For development, use the Supabase dashboard to manually insert into auth.users,
-- or create accounts via the /signup page and then run:

-- UPDATE public.profiles SET role = 'instructor' WHERE email = 'instructor1@eduflow.app';
-- UPDATE public.profiles SET role = 'instructor' WHERE email = 'instructor2@eduflow.app';

-- For seeding without real auth, use these placeholder UUIDs and skip auth.users
-- (queries will work — the instructor join will return null for non-existent profiles)

-- ── COURSES (10 published) ───────────────────────────────────────────────────
-- Use gen_random_uuid() for IDs so they differ every seed run.
-- Store the IDs in variables for referencing in modules/lessons.

DO $$
DECLARE
  c1 UUID := gen_random_uuid();
  c2 UUID := gen_random_uuid();
  c3 UUID := gen_random_uuid();
  c4 UUID := gen_random_uuid();
  c5 UUID := gen_random_uuid();
  c6 UUID := gen_random_uuid();
  c7 UUID := gen_random_uuid();
  c8 UUID := gen_random_uuid();
  c9 UUID := gen_random_uuid();
  c10 UUID := gen_random_uuid();
  m1 UUID; m2 UUID; m3 UUID;
BEGIN

-- Course 1: Python for Beginners (FREE)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c1, 'Python for Beginners: Your First Step into Programming',
  'python-for-beginners',
  'Start your programming journey with Python. This course takes you from zero to writing real Python programs. No prior experience needed.',
  'Learn Python from scratch. Variables, loops, functions, and your first real project.',
  'programming', 'beginner', 'free', 0, 'published',
  180, 22, 4820, 4.7, 1243,
  ARRAY[
    'Write Python programs from scratch',
    'Understand variables, data types, and operators',
    'Use loops and conditionals to control flow',
    'Define and call functions',
    'Work with lists, dictionaries, and tuples',
    'Read and write files',
    'Build a command-line contact book',
    'Debug common Python errors confidently'
  ],
  ARRAY[
    'A computer with internet access',
    'No prior programming experience required',
    'Python 3.x (installation walkthrough included)'
  ],
  'English', NOW()
);

-- Course 2: Full-Stack Web Dev with React + Supabase (PAID)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, original_price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c2, 'Full-Stack Web Development: React 18 + TypeScript + Supabase',
  'fullstack-react-supabase',
  'Build production-ready full-stack web apps. Master React 18, TypeScript, Tailwind CSS, Supabase auth, database, and storage. Deploy to Vercel.',
  'Build real full-stack apps with React, TypeScript, and Supabase. Go from zero to deployed.',
  'programming', 'intermediate', 'paid', 2999, 5999, 'published',
  720, 68, 3241, 4.9, 892,
  ARRAY[
    'Build full-stack applications with React 18 and TypeScript',
    'Implement authentication with Supabase Auth and Google OAuth',
    'Design and query PostgreSQL databases via Supabase',
    'Handle file uploads with Supabase Storage',
    'Use TanStack Query for server state management',
    'Style applications with Tailwind CSS and shadcn/ui',
    'Deploy to Vercel with CI/CD from GitHub',
    'Implement real-time features with Supabase Realtime'
  ],
  ARRAY[
    'Basic HTML, CSS, JavaScript knowledge',
    'Familiarity with ES6+ syntax (arrow functions, destructuring)',
    'No React experience required — taught from the start'
  ],
  'English', NOW()
);

-- Course 3: UI/UX Design Fundamentals (PAID)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, original_price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c3, 'UI/UX Design Fundamentals: From Wireframes to Figma',
  'uiux-design-fundamentals',
  'Learn the principles of user interface and user experience design. Go from basic wireframes to polished Figma prototypes. Build a portfolio-ready case study.',
  'Master UI/UX design from scratch. Figma, design systems, and a real portfolio project.',
  'design', 'beginner', 'paid', 1999, 3999, 'published',
  480, 45, 2180, 4.8, 634,
  ARRAY[
    'Apply core UI design principles (hierarchy, contrast, spacing)',
    'Create wireframes and user flows',
    'Design in Figma from scratch',
    'Build a complete design system with components',
    'Conduct basic user research and usability testing',
    'Create interactive prototypes',
    'Design responsive layouts for mobile and desktop',
    'Build a complete case study for your portfolio'
  ],
  ARRAY['A computer with Figma (free plan works)', 'No design experience required'],
  'English', NOW()
);

-- Course 4: Data Science with Python (PAID)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, original_price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c4, 'Data Science with Python: NumPy, Pandas & Matplotlib',
  'data-science-python',
  'Dive into data science using Python. Learn to clean, analyze, and visualize real-world datasets using NumPy, Pandas, and Matplotlib. Includes 3 real projects.',
  'Learn data analysis with Python. NumPy, Pandas, Matplotlib, and 3 real-world projects.',
  'data-science', 'intermediate', 'paid', 3499, 6999, 'published',
  600, 55, 1820, 4.7, 421,
  ARRAY[
    'Use NumPy for numerical computing',
    'Clean and manipulate data with Pandas',
    'Create visualizations with Matplotlib and Seaborn',
    'Perform exploratory data analysis (EDA)',
    'Work with real-world datasets (CSV, JSON, APIs)',
    'Build 3 complete data analysis projects',
    'Apply statistical concepts to data problems',
    'Export insights as reports and dashboards'
  ],
  ARRAY[
    'Basic Python knowledge (our Python for Beginners course recommended)',
    'No data science experience needed',
    'Jupyter Notebook (installation covered)'
  ],
  'English', NOW()
);

-- Course 5: Digital Marketing Mastery (PAID)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, original_price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c5, 'Digital Marketing Mastery: SEO, Social Media & Ads',
  'digital-marketing-mastery',
  'Master digital marketing from SEO to paid ads. Learn to build campaigns, grow organic traffic, and measure results with Google Analytics.',
  'Complete digital marketing course: SEO, social media, Google Ads, and analytics.',
  'marketing', 'beginner', 'paid', 1499, 2999, 'published',
  360, 38, 2940, 4.6, 789,
  ARRAY[
    'Build and execute a digital marketing strategy',
    'Optimize websites for search engines (SEO)',
    'Create and manage Google Ads campaigns',
    'Grow social media presence organically',
    'Run Facebook and Instagram ad campaigns',
    'Use Google Analytics to track and improve performance',
    'Build an email marketing campaign',
    'Create content that converts'
  ],
  ARRAY['Basic computer skills', 'No marketing background required'],
  'English', NOW()
);

-- Course 6: JavaScript Essentials (FREE)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c6, 'JavaScript Essentials: From Zero to DOM Manipulation',
  'javascript-essentials',
  'Learn JavaScript from the ground up. Variables, functions, objects, DOM manipulation, events, and modern ES6+ features. Build 5 hands-on projects.',
  'Learn JavaScript from scratch. Variables, functions, DOM, and 5 real projects.',
  'programming', 'beginner', 'free', 0, 'published',
  300, 30, 6210, 4.8, 1820,
  ARRAY[
    'Understand JavaScript syntax and core concepts',
    'Manipulate the DOM to build dynamic web pages',
    'Handle user events (clicks, inputs, forms)',
    'Use ES6+ features (let/const, arrow functions, modules)',
    'Work with asynchronous JavaScript (callbacks, promises, async/await)',
    'Fetch data from APIs with fetch()',
    'Build 5 complete mini-projects',
    'Debug JavaScript in Chrome DevTools'
  ],
  ARRAY['Basic HTML and CSS', 'A text editor (VS Code recommended)'],
  'English', NOW()
);

-- Course 7: Machine Learning A–Z (PAID)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, original_price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c7, 'Machine Learning A–Z: Scikit-Learn + TensorFlow',
  'machine-learning-az',
  'A complete machine learning course covering supervised, unsupervised, and deep learning. Implement algorithms from scratch and with Scikit-Learn and TensorFlow.',
  'Master machine learning: regression, classification, clustering, and neural networks.',
  'data-science', 'advanced', 'paid', 4999, 9999, 'published',
  900, 85, 1240, 4.9, 344,
  ARRAY[
    'Implement supervised and unsupervised ML algorithms',
    'Build and train neural networks with TensorFlow/Keras',
    'Apply feature engineering and data preprocessing',
    'Evaluate models with cross-validation and metrics',
    'Handle overfitting with regularization techniques',
    'Build a recommendation system from scratch',
    'Deploy a ML model as a REST API',
    'Understand the mathematics behind the algorithms'
  ],
  ARRAY[
    'Python proficiency (our Data Science course recommended)',
    'Basic statistics knowledge',
    'Calculus and linear algebra basics helpful but not required'
  ],
  'English', NOW()
);

-- Course 8: SQL & Database Management (PAID)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, original_price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c8, 'SQL & Database Management: PostgreSQL Mastery',
  'sql-postgresql-mastery',
  'Learn SQL from basics to advanced. Master SELECT, JOIN, aggregation, indexes, transactions, and PostgreSQL-specific features. Includes a capstone project.',
  'Master SQL and PostgreSQL: queries, joins, indexes, transactions, and a capstone project.',
  'programming', 'beginner', 'paid', 1999, 3999, 'published',
  420, 40, 2820, 4.7, 621,
  ARRAY[
    'Write SELECT queries with filtering, sorting, and limiting',
    'Join multiple tables (INNER, LEFT, RIGHT, FULL)',
    'Use aggregate functions (COUNT, SUM, AVG, GROUP BY)',
    'Design normalized database schemas',
    'Create and manage indexes for performance',
    'Write and manage transactions',
    'Use subqueries and CTEs',
    'PostgreSQL: JSON operations, window functions, stored procedures'
  ],
  ARRAY['No prior database experience required', 'PostgreSQL (installation covered)'],
  'English', NOW()
);

-- Course 9: Business Communication in English (PAID)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, original_price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c9, 'Business Communication in English: Emails, Meetings & Presentations',
  'business-communication-english',
  'Improve your professional English communication. Write clear emails, run effective meetings, give persuasive presentations, and network confidently.',
  'Master professional English: emails, presentations, meetings, and networking.',
  'business', 'beginner', 'paid', 999, 1999, 'published',
  240, 28, 3840, 4.5, 910,
  ARRAY[
    'Write professional emails that get responses',
    'Structure and deliver compelling presentations',
    'Facilitate and participate in productive meetings',
    'Use formal and informal business English appropriately',
    'Negotiate and persuade effectively in English',
    'Network confidently at professional events',
    'Improve grammar and vocabulary for business contexts',
    'Prepare for job interviews in English'
  ],
  ARRAY['Basic English reading/writing ability', 'No advanced English required'],
  'English', NOW()
);

-- Course 10: Graphic Design with Canva (FREE)
INSERT INTO public.courses (id, title, slug, description, short_description,
  category, level, pricing_type, price, status,
  duration_minutes, lesson_count, enrollment_count, rating, rating_count,
  what_you_learn, requirements, language, published_at)
VALUES (
  c10, 'Graphic Design with Canva: Social Media & Marketing Materials',
  'graphic-design-canva',
  'Learn graphic design using Canva — no design experience needed. Create stunning social media posts, presentations, logos, flyers, and more.',
  'Create beautiful designs with Canva. Social posts, flyers, presentations — no experience needed.',
  'design', 'beginner', 'free', 0, 'published',
  150, 18, 5420, 4.6, 1240,
  ARRAY[
    'Use Canva's design tools and templates effectively',
    'Create on-brand social media graphics for Instagram, LinkedIn, and Twitter',
    'Design professional presentations and pitch decks',
    'Build a logo and basic brand identity',
    'Design flyers, posters, and marketing materials',
    'Understand typography, color theory, and layout principles',
    'Export designs in multiple formats for print and digital',
    'Use Canva Pro features (if available)'
  ],
  ARRAY['A Canva account (free plan works perfectly)', 'No design skills needed'],
  'English', NOW()
);

-- ── MODULES for Course 2 (Full-Stack React + Supabase) ───────────────────────
SELECT gen_random_uuid() INTO m1;
SELECT gen_random_uuid() INTO m2;
SELECT gen_random_uuid() INTO m3;

INSERT INTO public.modules (id, course_id, title, order_index) VALUES
  (m1, c2, 'Module 1 — Foundation & Project Setup', 0),
  (m2, c2, 'Module 2 — Authentication with Supabase', 1),
  (m3, c2, 'Module 3 — Building the Data Layer', 2);

-- Lessons for Module 1
INSERT INTO public.lessons (module_id, course_id, title, type, duration_minutes, order_index, is_free_preview) VALUES
  (m1, c2, 'Welcome & Course Overview',                  'video', 5,  0, true),
  (m1, c2, 'Setting Up Vite + React 18 + TypeScript',   'video', 12, 1, true),
  (m1, c2, 'Configuring Tailwind CSS & shadcn/ui',       'video', 15, 2, false),
  (m1, c2, 'Project Structure Deep Dive',                'text',  8,  3, false),
  (m1, c2, 'Module 1 Resources',                        'pdf',   0,  4, false),
  (m1, c2, 'Module 1 Quiz',                             'quiz',  10, 5, false);

-- Lessons for Module 2
INSERT INTO public.lessons (module_id, course_id, title, type, duration_minutes, order_index, is_free_preview) VALUES
  (m2, c2, 'Introduction to Supabase',                  'video', 10, 0, true),
  (m2, c2, 'Email + Password Authentication',            'video', 20, 1, false),
  (m2, c2, 'Google OAuth Setup',                        'video', 15, 2, false),
  (m2, c2, 'Protected Routes with React Router',        'video', 18, 3, false),
  (m2, c2, 'Role-Based Access Control',                 'video', 22, 4, false),
  (m2, c2, 'Auth Assignment',                           'assignment', 0, 5, false);

-- Lessons for Module 3
INSERT INTO public.lessons (module_id, course_id, title, type, duration_minutes, order_index, is_free_preview) VALUES
  (m3, c2, 'PostgreSQL Schema Design',                  'video', 18, 0, false),
  (m3, c2, 'Row Level Security Explained',              'video', 25, 1, false),
  (m3, c2, 'TanStack Query for Server State',           'video', 20, 2, false),
  (m3, c2, 'CRUD Operations with Supabase JS',          'video', 30, 3, false),
  (m3, c2, 'Real-time Subscriptions',                   'video', 22, 4, false),
  (m3, c2, 'Module 3 Quiz',                             'quiz',  15, 5, false);

-- Update lesson_count for course c2
UPDATE public.courses SET lesson_count = 18, duration_minutes = 285 WHERE id = c2;

-- ── REVIEWS for Course 2 ─────────────────────────────────────────────────────
-- Note: reviews require real user UUIDs. Insert placeholder reviews with fake UUIDs.
-- In production these will come from real users. For dev, skip the foreign key
-- check by using profiles that actually exist, OR use a review seeding script.

END $$;
```

---

## 4. NEW TYPESCRIPT ADDITIONS — `src/lib/types.ts`

Add these to the existing types file (do not replace existing types):

```typescript
// ─── CATALOG FILTER STATE ─────────────────────────────────────────────────

export interface CourseFilters {
  q:         string           // search query
  category:  CourseCategory[] // multi-select
  level:     CourseLevel[]    // multi-select
  pricing:   PricingFilter    // single-select
  rating:    number | null    // minimum rating (e.g. 4.5)
  duration:  DurationFilter[] // multi-select
  language:  string[]         // multi-select
  sort:      CourseSortOption
  page:      number
}

export type PricingFilter  = 'all' | 'free' | 'paid' | 'under500' | '500to2000' | 'above2000'
export type DurationFilter = 'under2h' | '2to5h' | '5to10h' | 'above10h'
export type CourseSortOption =
  | 'popular'     // enrollment_count DESC
  | 'newest'      // published_at DESC
  | 'rating'      // rating DESC
  | 'price_asc'   // price ASC
  | 'price_desc'  // price DESC

export const DEFAULT_FILTERS: CourseFilters = {
  q:        '',
  category: [],
  level:    [],
  pricing:  'all',
  rating:   null,
  duration: [],
  language: [],
  sort:     'popular',
  page:     1,
}

// ─── PAGINATED RESULT ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data:        T[]
  count:       number   // total matching records
  page:        number
  pageSize:    number
  pageCount:   number
}

// ─── REVIEW ──────────────────────────────────────────────────────────────

export interface Review {
  id:           string
  course_id:    string
  user_id:      string
  user:         Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  rating:       number
  title:        string | null
  body:         string
  helpful_count: number
  created_at:   string
}

export interface RatingBreakdown {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>  // count per star
  percentages:  Record<1 | 2 | 3 | 4 | 5, number>  // percentage per star
}

// ─── COURSE DETAIL (extended) ─────────────────────────────────────────────

export interface CourseWithContent extends Course {
  modules: ModuleWithLessons[]
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}
```

---

## 5. URL PARAMETER SCHEMA

All filter + pagination state lives in the URL. This enables shareability and browser back/forward.

| URL Param | Maps to | Type | Example |
|-----------|---------|------|---------|
| `q` | `filters.q` | string | `?q=react` |
| `category` | `filters.category` | comma-separated | `?category=programming,design` |
| `level` | `filters.level` | comma-separated | `?level=beginner,intermediate` |
| `pricing` | `filters.pricing` | enum | `?pricing=free` |
| `rating` | `filters.rating` | number | `?rating=4.5` |
| `duration` | `filters.duration` | comma-separated | `?duration=under2h,2to5h` |
| `language` | `filters.language` | comma-separated | `?language=English,Hindi` |
| `sort` | `filters.sort` | enum | `?sort=newest` |
| `page` | `filters.page` | integer | `?page=2` |

**URL example**: `/catalog?q=python&category=programming,data-science&level=beginner&sort=rating&page=1`

---

## 6. FILTER STATE HOOK — `src/hooks/useFilterState.ts`

This hook syncs URL params → filter state → URL params. This is the most critical hook in Phase 2.

```typescript
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CourseFilters, DEFAULT_FILTERS,
  CourseCategory, CourseLevel, DurationFilter, CourseSortOption, PricingFilter
} from '@/lib/types'

function parseCommaList<T extends string>(value: string | null): T[] {
  if (!value) return []
  return value.split(',').filter(Boolean) as T[]
}

export function useFilterState() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive filter state from URL params (no local state — URL is the state)
  const filters: CourseFilters = useMemo(() => ({
    q:        searchParams.get('q')        ?? '',
    category: parseCommaList<CourseCategory>(searchParams.get('category')),
    level:    parseCommaList<CourseLevel>(searchParams.get('level')),
    pricing:  (searchParams.get('pricing') ?? 'all') as PricingFilter,
    rating:   searchParams.get('rating')   ? Number(searchParams.get('rating')) : null,
    duration: parseCommaList<DurationFilter>(searchParams.get('duration')),
    language: parseCommaList(searchParams.get('language')),
    sort:     (searchParams.get('sort')    ?? 'popular') as CourseSortOption,
    page:     Number(searchParams.get('page') ?? '1'),
  }), [searchParams])

  // Update one or more filter keys + reset page to 1 (unless page is the only thing changing)
  const setFilters = useCallback((
    updates: Partial<CourseFilters>,
    options?: { keepPage?: boolean }
  ) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)

      const apply = options?.keepPage ? updates : { ...updates, page: 1 }

      Object.entries(apply).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' ||
            value === DEFAULT_FILTERS[key as keyof CourseFilters] ||
            (Array.isArray(value) && value.length === 0)) {
          next.delete(key)
        } else if (Array.isArray(value)) {
          next.set(key, value.join(','))
        } else {
          next.set(key, String(value))
        }
      })

      return next
    }, { replace: true })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.q)                 count++
    if (filters.category.length)   count += filters.category.length
    if (filters.level.length)      count += filters.level.length
    if (filters.pricing !== 'all') count++
    if (filters.rating !== null)   count++
    if (filters.duration.length)   count += filters.duration.length
    if (filters.language.length)   count += filters.language.length
    return count
  }, [filters])

  return { filters, setFilters, clearFilters, activeFilterCount }
}
```

---

## 7. TANSTACK QUERY HOOKS

### 7.1 `src/hooks/queries/useFeaturedCourses.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'

async function fetchFeaturedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, slug, thumbnail_url, short_description,
      category, level, pricing_type, price, original_price,
      rating, rating_count, enrollment_count, duration_minutes, lesson_count,
      profiles!instructor_id(id, full_name, avatar_url)
    `)
    .eq('status', 'published')
    .order('enrollment_count', { ascending: false })
    .limit(6)

  if (error) throw error
  return (data ?? []).map(row => ({
    ...row,
    instructor: row.profiles as Course['instructor'],
  })) as Course[]
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: ['courses', 'featured'],
    queryFn:  fetchFeaturedCourses,
    staleTime: 1000 * 60 * 10,  // 10 minutes
  })
}
```

### 7.2 `src/hooks/queries/useCourses.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, CourseFilters, PaginatedResult } from '@/lib/types'

const PAGE_SIZE = 12

function durationToMinutes(filter: string): [number, number] {
  switch (filter) {
    case 'under2h':   return [0,   120]
    case '2to5h':     return [120, 300]
    case '5to10h':    return [300, 600]
    case 'above10h':  return [600, 99999]
    default:          return [0,   99999]
  }
}

async function fetchCourses(filters: CourseFilters): Promise<PaginatedResult<Course>> {
  let query = supabase
    .from('courses')
    .select(`
      id, title, slug, thumbnail_url, short_description,
      category, level, pricing_type, price, original_price,
      rating, rating_count, enrollment_count, duration_minutes, lesson_count,
      profiles!instructor_id(id, full_name, avatar_url)
    `, { count: 'exact' })
    .eq('status', 'published')

  // Search query
  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,short_description.ilike.%${filters.q}%`
    )
  }

  // Category filter (multi-select = OR)
  if (filters.category.length > 0) {
    query = query.in('category', filters.category)
  }

  // Level filter (multi-select = OR)
  if (filters.level.length > 0) {
    query = query.in('level', filters.level)
  }

  // Pricing filter
  switch (filters.pricing) {
    case 'free':       query = query.eq('pricing_type', 'free'); break
    case 'paid':       query = query.eq('pricing_type', 'paid'); break
    case 'under500':   query = query.lt('price', 500); break
    case '500to2000':  query = query.gte('price', 500).lte('price', 2000); break
    case 'above2000':  query = query.gt('price', 2000); break
  }

  // Rating filter (minimum)
  if (filters.rating !== null) {
    query = query.gte('rating', filters.rating)
  }

  // Duration filter (multiple ranges = OR — Supabase doesn't support this directly,
  // so if multiple duration filters are selected, we take the widest range)
  if (filters.duration.length > 0) {
    const ranges = filters.duration.map(durationToMinutes)
    const minMinutes = Math.min(...ranges.map(r => r[0]))
    const maxMinutes = Math.max(...ranges.map(r => r[1]))
    query = query.gte('duration_minutes', minMinutes).lte('duration_minutes', maxMinutes)
  }

  // Language filter
  if (filters.language.length > 0) {
    query = query.in('language', filters.language)
  }

  // Sort
  switch (filters.sort) {
    case 'newest':     query = query.order('published_at', { ascending: false }); break
    case 'rating':     query = query.order('rating', { ascending: false }); break
    case 'price_asc':  query = query.order('price', { ascending: true });  break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    default:           query = query.order('enrollment_count', { ascending: false }); break
  }

  // Pagination
  const from = (filters.page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const courses = (data ?? []).map(row => ({
    ...row,
    instructor: row.profiles as Course['instructor'],
  })) as Course[]

  const totalCount  = count ?? 0
  const pageCount   = Math.ceil(totalCount / PAGE_SIZE)

  return { data: courses, count: totalCount, page: filters.page, pageSize: PAGE_SIZE, pageCount }
}

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ['courses', 'catalog', filters],
    queryFn:  () => fetchCourses(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,   // keep previous data visible while new page loads
  })
}

export { PAGE_SIZE }
```

### 7.3 `src/hooks/queries/useCourse.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CourseWithContent } from '@/lib/types'

async function fetchCourse(courseId: string): Promise<CourseWithContent> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      profiles!instructor_id(id, full_name, avatar_url, bio, created_at, department),
      modules(
        id, title, description, order_index,
        lessons(
          id, title, type, content_url, duration_minutes, order_index, is_free_preview
        )
      )
    `)
    .eq('id', courseId)
    .eq('status', 'published')
    .single()

  if (error) throw error
  if (!data)  throw new Error('Course not found')

  // Sort modules and lessons by order_index
  const modules = (data.modules ?? [])
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map((m: any) => ({
      ...m,
      lessons: (m.lessons ?? []).sort((a: any, b: any) => a.order_index - b.order_index),
    }))

  return {
    ...data,
    instructor: data.profiles as CourseWithContent['instructor'],
    modules,
  } as CourseWithContent
}

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn:  () => fetchCourse(courseId!),
    enabled:  !!courseId,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => {
      // Don't retry if course not found (PGRST116 = no rows)
      if (error?.code === 'PGRST116') return false
      return failureCount < 2
    },
  })
}
```

### 7.4 `src/hooks/queries/useEnrollmentStatus.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Enrollment } from '@/lib/types'

async function fetchEnrollmentStatus(
  courseId: string, userId: string
): Promise<Enrollment | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, status, progress, enrolled_at')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle()   // returns null if not found, not an error

  if (error) throw error
  return data as Enrollment | null
}

export function useEnrollmentStatus(courseId: string | undefined) {
  const user = useAuthStore(s => s.user)

  return useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    queryFn:  () => fetchEnrollmentStatus(courseId!, user!.id),
    enabled:  !!courseId && !!user,
    staleTime: 0,  // always check fresh enrollment status
  })
}
```

### 7.5 `src/hooks/queries/useCourseReviews.ts`

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Review } from '@/lib/types'

const REVIEWS_PAGE_SIZE = 8

async function fetchReviews(courseId: string, page: number): Promise<Review[]> {
  const from = page * REVIEWS_PAGE_SIZE
  const to   = from + REVIEWS_PAGE_SIZE - 1

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, rating, title, body, helpful_count, created_at,
      profiles!user_id(id, full_name, avatar_url)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return (data ?? []).map(r => ({ ...r, user: r.profiles })) as Review[]
}

export function useCourseReviews(courseId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['reviews', courseId],
    queryFn:  ({ pageParam = 0 }) => fetchReviews(courseId!, pageParam as number),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === REVIEWS_PAGE_SIZE ? allPages.length : undefined,
    enabled: !!courseId,
    initialPageParam: 0,
  })
}
```

---

## 8. COMPONENT APIS (PROPS + KEY BEHAVIOR)

### `<CourseCard course={Course} />`

```typescript
interface CourseCardProps {
  course: Course
  variant?: 'default' | 'compact'   // compact = no description line
}
```

- Entire card + button both navigate to `/catalog/${course.id}`
- Use `<Link>` from react-router-dom, not `onClick + navigate()`
- Price display logic:
  ```
  if pricing_type === 'free' → "Free" (text-success)
  if original_price exists  → show original_price struck-through + price
  else                      → show price only
  ```
- Discount badge: if `original_price > price` → calculate `Math.round((1 - price/original_price) * 100)` → show `{n}% off`

### `<FilterPanel filters={CourseFilters} onFilterChange={fn} />`

```typescript
interface FilterPanelProps {
  filters:        CourseFilters
  onFilterChange: (updates: Partial<CourseFilters>) => void
  onClear:        () => void
}
```

- Each checkbox/radio directly calls `onFilterChange` — no local "apply" button needed
- Sections use Radix Accordion for collapse/expand
- Course counts per category/level are hardcoded in Phase 2; Phase 8 makes them dynamic

### `<Pagination page={n} pageCount={n} onChange={fn} />`

```typescript
interface PaginationProps {
  page:      number
  pageCount: number
  onChange:  (page: number) => void
}
```

- Render up to 7 page buttons with ellipsis: `1 2 3 ... 7 8 9` or `1 ... 4 5 6 ... 10`
- Always show first, last, and 2 pages around current
- Previous/Next arrows disabled at boundaries

### `<CurriculumAccordion modules={ModuleWithLessons[]} enrollmentStatus={Enrollment|null} />`

```typescript
interface CurriculumAccordionProps {
  modules:          ModuleWithLessons[]
  enrollmentStatus: Enrollment | null
  courseId:         string
}
```

- Uses Radix `<Accordion type="multiple">` — multiple modules can be open at once
- Default open: the first module only (`defaultValue={[modules[0]?.id]}`)
- Lock icon: rendered for non-preview lessons when `enrollmentStatus === null`
- [Preview] button: `<Link to={/learn/${courseId}/lesson/${lesson.id}}>Preview</Link>`

### `<StarRating rating={n} count={n} size='sm'|'md'|'lg' />`

```typescript
interface StarRatingProps {
  rating:      number   // 0.0 – 5.0
  count?:      number   // show "(2,847 ratings)" when provided
  interactive?: boolean // false by default (display only)
  onChange?:   (rating: number) => void  // only when interactive
  size?:       'sm' | 'md' | 'lg'
}
```

- Display: filled amber stars + half-star support (using CSS clip-path trick or lucide Half)
- `sm`: star = 12px, `md`: star = 16px, `lg`: star = 20px

### `<RatingBreakdown breakdown={RatingBreakdown} />`

```typescript
interface RatingBreakdownProps {
  rating:    number
  breakdown: RatingBreakdown
}
```

- Progress bars use `<div>` with inline width style: `style={{ width: `${pct}%` }}`
- Calculate breakdown from reviews array:
  ```typescript
  function calcBreakdown(reviews: Review[]): RatingBreakdown {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => dist[r.rating as 1|2|3|4|5]++)
    const total = reviews.length || 1
    const pcts  = Object.fromEntries(
      Object.entries(dist).map(([k, v]) => [k, Math.round((v / total) * 100)])
    ) as Record<1|2|3|4|5, number>
    return { distribution: dist, percentages: pcts }
  }
  ```
  Pass all `data.pages.flat()` from `useCourseReviews` to this function.

### `<PaymentModal isOpen course onClose />`

- Use Radix `<Dialog>` (shadcn Dialog component)
- Prevent background scroll when open: Radix handles this automatically
- Backdrop click closes modal (Radix default behavior)
- Escape key closes modal (Radix default behavior)

---

## 9. FREE COURSE ENROLLMENT MUTATION

When user clicks [Enroll Now] on a free course:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

function useEnrollFree(courseId: string) {
  const qc       = useQueryClient()
  const navigate = useNavigate()
  const user     = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('enrollments')
        .insert({ user_id: user.id, course_id: courseId, status: 'active' })
        .select('id')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Enrolled successfully! Let\'s start learning.')
      qc.invalidateQueries({ queryKey: ['enrollment', courseId] })
      navigate(`/learn/${courseId}`)
    },
    onError: (err: any) => {
      // PGRST unique constraint = already enrolled
      if (err.code === '23505') {
        toast.info('You\'re already enrolled in this course.')
        navigate(`/learn/${courseId}`)
      } else {
        toast.error('Enrollment failed. Please try again.')
      }
    },
  })
}
```

---

## 10. COURSE DETAIL STICKY CARD IMPLEMENTATION

The sticky card must behave correctly across all scroll positions. Use CSS `position: sticky` — do NOT use a JS scroll event listener.

```typescript
// In CourseDetailPage.tsx layout
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 py-8">
  {/* Left column — main content */}
  <div className="lg:col-span-8">
    {/* What you'll learn, curriculum, instructor, reviews, related */}
  </div>

  {/* Right column — sticky card */}
  <div className="hidden lg:block lg:col-span-4">
    <div className="sticky top-[76px]">   {/* 60px topbar + 16px gap */}
      <CTACard course={course} enrollment={enrollmentStatus} />
    </div>
  </div>
</div>
```

**Important**: `top-[76px]` = 60px topbar height + 16px padding. Adjust if your topbar height differs from 60px.

The parent container (`lg:col-span-4`) must **not** have `overflow: hidden` or a fixed height — this would break `position: sticky`.

---

## 11. SEO IMPLEMENTATION

### Install and configure react-helmet-async

Add `<HelmetProvider>` to `src/main.tsx`:

```typescript
import { HelmetProvider } from 'react-helmet-async'
// Wrap the entire app:
<HelmetProvider>
  <BrowserRouter>
    ...
  </BrowserRouter>
</HelmetProvider>
```

### Per-page usage

**Landing page**:
```typescript
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>EduFlow LMS — Learn Skills, Earn Certificates, Grow Your Career</title>
  <meta name="description"
    content="Access 200+ expert-led courses on programming, design, business, and data science. Learn at your own pace with AI-powered tutoring and earn verified certificates." />
  <meta property="og:title" content="EduFlow LMS" />
  <meta property="og:description" content="Your learning journey starts here." />
  <meta property="og:type" content="website" />
</Helmet>
```

**Catalog page**:
```typescript
<Helmet>
  <title>Browse Courses — EduFlow LMS</title>
  <meta name="description"
    content="Explore 200+ expert-led courses. Filter by category, level, and price. Start learning today." />
</Helmet>
```

**Course detail** (dynamic — only render after course data is loaded):
```typescript
{course && (
  <Helmet>
    <title>{course.title} — EduFlow LMS</title>
    <meta name="description" content={course.short_description ?? course.description.slice(0, 155)} />
    {course.thumbnail_url && <meta property="og:image" content={course.thumbnail_url} />}
    <meta property="og:type" content="article" />
    <link rel="canonical" href={`${import.meta.env.VITE_APP_URL}/catalog/${course.id}`} />
  </Helmet>
)}
```

---

## 12. LOADING SKELETON IMPLEMENTATIONS

### `<CourseCardSkeleton />`

```typescript
export function CourseCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Thumbnail */}
      <div className="h-40 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        {/* Rating + stars */}
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
        {/* Title */}
        <div className="h-5 w-full rounded bg-muted animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
        {/* Instructor */}
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
        {/* Meta */}
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
        </div>
        {/* Price + button */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-7 w-20 rounded bg-muted animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}
```

### Course Detail Skeleton

Render when `useCourse` is loading:
- Hero: dark background with pulse shapes for title (3 lines), meta row, rating
- Left column: 3 accordion skeletons + instructor skeleton
- Right column sticky card: thumbnail skeleton + price + button skeleton

---

## 13. ERROR HANDLING

### useCourse — course not found

In `CourseDetailPage.tsx`, after the query resolves:

```typescript
const { data: course, isLoading, error } = useCourse(courseId)

useEffect(() => {
  if (error) {
    // PGRST116 = no rows returned (course not found or not published)
    navigate('/404', { replace: true })
  }
}, [error])
```

### useCourses — catalog fetch error

In `CatalogPage.tsx`:

```typescript
const { data, isLoading, isError, refetch } = useCourses(filters)

if (isError) {
  return (
    <ErrorState
      title="Couldn't load courses"
      description="Something went wrong while fetching courses."
      action={{ label: 'Try Again', onClick: () => refetch() }}
    />
  )
}
```

---

## 14. PERFORMANCE REQUIREMENTS

| Metric | Target | How to achieve |
|--------|--------|---------------|
| Catalog initial load | < 1.5s on 3G | Paginate (12/page), select only needed columns |
| Filter response time | < 300ms perceived | `placeholderData` keeps old results during new fetch |
| Course detail load | < 1s on fast 3G | Single query with joins, no waterfall |
| Landing page LCP | < 2.5s | Limit featured courses query to 6, static content for other sections |

**Image optimization**: All `<img>` tags for course thumbnails must have:
- `loading="lazy"` (except above-the-fold hero images)
- `width` + `height` attributes (or equivalent aspect-ratio CSS)
- `alt` attribute with course title

**Prefetching**: Prefetch course detail on CourseCard hover:
```typescript
const qc = useQueryClient()
const handleMouseEnter = () => {
  qc.prefetchQuery({
    queryKey: ['course', course.id],
    queryFn:  () => fetchCourse(course.id),
    staleTime: 1000 * 60 * 5,
  })
}
<div onMouseEnter={handleMouseEnter}>...</div>
```

---

## 15. IMPLEMENTATION ORDER

Follow this exact order to avoid blocked dependencies:

```
1. Run Supabase SQL (Section 2) — tables must exist before any query runs
2. Run seed data SQL (Section 3) — pages need content to be testable
3. Add new types to src/lib/types.ts (Section 4)
4. Create useFilterState.ts (Section 6) — catalog page depends on it
5. Create all query hooks (Section 7) — pages depend on hooks
6. Build CourseCard + CourseCardSkeleton (Section 8) — used in landing + catalog
7. Build LandingPage.tsx (replace stub) — uses useFeaturedCourses
8. Build FilterPanel + FilterDrawer + SortDropdown + Pagination (Section 8)
9. Build CatalogPage.tsx (replace stub) — uses useCourses + all filter components
10. Build CurriculumAccordion + ReviewCard + InstructorBio + RatingBreakdown
11. Build PaymentModal (Section 7, PRD)
12. Build CourseDetailPage.tsx (replace stub) — most complex page
13. Add Helmet tags to all 3 pages (Section 11)
14. Test all acceptance criteria from PRD Section 13
```

---

## 16. CRITICAL IMPLEMENTATION NOTES

1. **`useSearchParams` in React Router 6** — must wrap CatalogPage's parent route in `<BrowserRouter>` (already done in Phase 1). `useSearchParams` reads from the URL bar, not from component state. Any call to `setSearchParams` causes a navigation + re-render.

2. **Supabase `maybeSingle()` vs `single()`** — use `maybeSingle()` for enrollment status check. `single()` throws a 406 error if no row is found. `maybeSingle()` returns `null`.

3. **Do NOT use `useEffect` to sync filter state to URL** — `useFilterState.ts` derives state directly from URL params using `useMemo`. There is no local state and no `useEffect` needed. URL is the state.

4. **TanStack Query `placeholderData`** — in `useCourses`, passing `placeholderData: (prev) => prev` means the previous page's results stay visible while the new page loads. This prevents a jarring empty→skeleton→results flash when changing pages or filters.

5. **Sticky card and `position: sticky`** — works only when the card's parent does NOT have `overflow: hidden`, `overflow: auto`, or a fixed height. Common mistake: setting `overflow-hidden` on a wrapper to crop an image. Use `overflow-hidden` only on the image container, not on any ancestor of the sticky card.

6. **Free course enrollment RLS** — the policy in Section 2.5 only allows `INSERT` when `pricing_type = 'free'`. Paid course enrollment happens via a Supabase Edge Function in Phase 9 that uses the `service_role` key to bypass RLS. Do NOT change the RLS policy to allow all inserts.

7. **Sort dropdown and URL params** — when the user changes the sort, reset `page` to 1. The `useFilterState.setFilters` function does this automatically (resets page unless `keepPage: true` is passed).

8. **Course not found vs not published** — both return no rows from the Supabase query (because the RLS policy on `courses` only allows reads where `status = 'published'`). The `useCourse` hook catches this and the error handler in `CourseDetailPage` redirects to `/404`.

9. **Review counts and rating breakdown** — `courses.rating` and `courses.rating_count` are stored as aggregate columns (kept in sync by DB triggers in Phase 4+). For Phase 2, these values come from the seed data. `RatingBreakdown` is computed client-side from the fetched reviews array.

10. **Prefetching on hover** — `qc.prefetchQuery` is fire-and-forget. It will not cause re-renders. Only call it if the query is not already in cache (`qc.getQueryState(['course', id])?.status !== 'success'`).
```
