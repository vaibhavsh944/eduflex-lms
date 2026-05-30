import type { Profile, Course, Lesson, Module, Enrollment, Quiz, Assignment, Submission, Grade, Certificate, Badge, UserBadge, Announcement, Message, Notification, ForumThread, ForumReply, AuditLog } from './types';
import { Question, RubricCriteria } from './types';

// ─── Mock Profiles ─────────────────────────────────────────────────────────
export const mockProfiles: Profile[] = [
  {
    id: 'user-1',
    email: 'student@eduflow.com',
    full_name: 'John Student',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'student',
    bio: 'Passionate learner exploring web development',
    department: 'Computer Science',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    total_xp: 350,
    level: 2,
  },
  {
    id: 'user-2',
    email: 'instructor@eduflow.com',
    full_name: 'Dr. Sarah Instructor',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    role: 'instructor',
    bio: 'Senior software engineer with 10+ years experience',
    department: 'Computer Science',
    is_active: true,
    created_at: '2023-06-01T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
    total_xp: 0,
    level: 1,
  },
  {
    id: 'user-3',
    email: 'admin@eduflow.com',
    full_name: 'Admin User',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    role: 'admin',
    bio: 'Platform administrator',
    department: 'Operations',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    total_xp: 0,
    level: 1,
  },
];

// ─── Mock Courses ────────────────────────────────────────────────────────────
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Complete React Developer Course',
    description: 'Master React from scratch. Learn hooks, context, Redux, and build real-world applications.',
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    instructor_id: 'user-2',
    instructor: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    category: 'programming',
    level: 'intermediate',
    pricing_type: 'paid',
    price: 99.99,
    status: 'published',
    tags: ['React', 'JavaScript', 'Frontend'],
    duration_minutes: 1200,
    lesson_count: 24,
    enrollment_count: 1250,
    rating: 4.8,
    rating_count: 342,
    what_you_learn: ['Build React apps from scratch', 'Master React Hooks', 'State management with Redux'],
    requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'course-2',
    title: 'Python for Data Science',
    description: 'Learn Python programming and data analysis with pandas, numpy, and matplotlib.',
    thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop',
    instructor_id: 'user-2',
    instructor: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    category: 'data-science',
    level: 'beginner',
    pricing_type: 'paid',
    price: 79.99,
    status: 'published',
    tags: ['Python', 'Data Science', 'Machine Learning'],
    duration_minutes: 900,
    lesson_count: 18,
    enrollment_count: 890,
    rating: 4.7,
    rating_count: 215,
    what_you_learn: ['Python fundamentals', 'Data analysis with pandas', 'Data visualization'],
    requirements: ['No prior programming experience needed'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'course-3',
    title: 'UI/UX Design Fundamentals',
    description: 'Design beautiful interfaces with Figma. Learn design principles, prototyping, and user research.',
    thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    instructor_id: 'user-2',
    instructor: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    category: 'design',
    level: 'beginner',
    pricing_type: 'paid',
    price: 69.99,
    status: 'published',
    tags: ['UI/UX', 'Figma', 'Design'],
    duration_minutes: 600,
    lesson_count: 12,
    enrollment_count: 650,
    rating: 4.9,
    rating_count: 189,
    what_you_learn: ['Design fundamentals', 'Figma proficiency', 'User research methods'],
    requirements: ['No design experience required'],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
  },
  {
    id: 'course-4',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into TypeScript. Learn generics, decorators, and advanced type system.',
    thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697500bea?w=800&h=400&fit=crop',
    instructor_id: 'user-2',
    instructor: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    category: 'programming',
    level: 'advanced',
    pricing_type: 'paid',
    price: 119.99,
    status: 'published',
    tags: ['TypeScript', 'Advanced', 'Programming'],
    duration_minutes: 800,
    lesson_count: 16,
    enrollment_count: 420,
    rating: 4.6,
    rating_count: 98,
    what_you_learn: ['Advanced TypeScript', 'Generic patterns', 'Type-level programming'],
    requirements: ['Strong TypeScript knowledge'],
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-04-15T00:00:00Z',
  },
  {
    id: 'course-5',
    title: 'Digital Marketing Masterclass',
    description: 'Learn SEO, social media marketing, email campaigns, and paid advertising strategies.',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    instructor_id: 'user-2',
    instructor: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    category: 'marketing',
    level: 'intermediate',
    pricing_type: 'paid',
    price: 89.99,
    status: 'published',
    tags: ['Marketing', 'SEO', 'Business'],
    duration_minutes: 720,
    lesson_count: 14,
    enrollment_count: 780,
    rating: 4.5,
    rating_count: 156,
    what_you_learn: ['SEO basics', 'Social media marketing', 'Paid advertising'],
    requirements: ['Basic marketing understanding'],
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-05-20T00:00:00Z',
  },
  {
    id: 'course-6',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend APIs with Node.js, Express, and MongoDB.',
    thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
    instructor_id: 'user-2',
    instructor: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    category: 'programming',
    level: 'intermediate',
    pricing_type: 'paid',
    price: 109.99,
    status: 'published',
    tags: ['Node.js', 'Backend', 'API'],
    duration_minutes: 960,
    lesson_count: 20,
    enrollment_count: 560,
    rating: 4.7,
    rating_count: 134,
    what_you_learn: ['Node.js fundamentals', 'Express API development', 'MongoDB integration'],
    requirements: ['JavaScript knowledge required'],
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
  },
];

// ─── Mock Modules & Lessons ─────────────────────────────────────────────────
export const mockModules: Record<string, Module[]> = {
  'course-1': [
    {
      id: 'module-1-1',
      course_id: 'course-1',
      title: 'Getting Started with React',
      order_index: 0,
      lessons: [],
    },
    {
      id: 'module-1-2',
      course_id: 'course-1',
      title: 'React Components Deep Dive',
      order_index: 1,
      lessons: [],
    },
  ],
};

export const mockLessons: Record<string, Lesson[]> = {
  'course-1': [
    {
      id: 'lesson-1-1',
      module_id: 'module-1-1',
      course_id: 'course-1',
      title: 'Introduction to React',
      type: 'video',
      content_url: 'https://example.com/videos/intro-react.mp4',
      content_text: '# Introduction to React\n\nReact is a JavaScript library for building user interfaces...',
      duration_minutes: 45,
      order_index: 0,
      is_free_preview: true,
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 'lesson-1-2',
      module_id: 'module-1-1',
      course_id: 'course-1',
      title: 'Components and Props',
      type: 'video',
      content_url: 'https://example.com/videos/components-props.mp4',
      content_text: '# Components and Props\n\nComponents are the building blocks of React applications...',
      duration_minutes: 60,
      order_index: 1,
      is_free_preview: false,
      created_at: '2024-01-03T00:00:00Z',
    },
    {
      id: 'lesson-1-3',
      module_id: 'module-1-2',
      course_id: 'course-1',
      title: 'State and useState',
      type: 'video',
      content_url: 'https://example.com/videos/state-usestate.mp4',
      content_text: '# State and useState\n\nState allows components to remember information...',
      duration_minutes: 55,
      order_index: 2,
      is_free_preview: false,
      created_at: '2024-01-04T00:00:00Z',
    },
    {
      id: 'lesson-1-4',
      module_id: 'module-1-2',
      course_id: 'course-1',
      title: 'Effects and useEffect',
      type: 'video',
      content_url: 'https://example.com/videos/useeffect.mp4',
      content_text: '# Effects and useEffect\n\nuseEffect lets you perform side effects in function components...',
      duration_minutes: 50,
      order_index: 3,
      is_free_preview: false,
      created_at: '2024-01-05T00:00:00Z',
    },
  ],
  'course-2': [
    {
      id: 'lesson-2-1',
      module_id: 'module-2-1',
      course_id: 'course-2',
      title: 'Python Basics',
      type: 'video',
      content_url: 'https://example.com/videos/python-basics.mp4',
      content_text: '# Python Basics\n\nPython is a versatile programming language...',
      duration_minutes: 40,
      order_index: 0,
      is_free_preview: true,
      created_at: '2024-02-02T00:00:00Z',
    },
    {
      id: 'lesson-2-2',
      module_id: 'module-2-1',
      course_id: 'course-2',
      title: 'Data Structures',
      type: 'video',
      content_url: 'https://example.com/videos/data-structures.mp4',
      content_text: '# Data Structures\n\nPython provides several built-in data structures...',
      duration_minutes: 65,
      order_index: 1,
      is_free_preview: false,
      created_at: '2024-02-03T00:00:00Z',
    },
  ],
};

// ─── Mock Enrollments ───────────────────────────────────────────────────────
export const mockEnrollments: Enrollment[] = [
  {
    id: 'enroll-1',
    user_id: 'user-1',
    course_id: 'course-1',
    course: mockCourses[0],
    status: 'active',
    progress: 75,
    enrolled_at: '2024-01-10T00:00:00Z',
    completed_at: null,
  },
  {
    id: 'enroll-2',
    user_id: 'user-1',
    course_id: 'course-2',
    course: mockCourses[1],
    status: 'completed',
    progress: 100,
    enrolled_at: '2024-02-05T00:00:00Z',
    completed_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 'enroll-3',
    user_id: 'user-1',
    course_id: 'course-3',
    course: mockCourses[2],
    status: 'active',
    progress: 30,
    enrolled_at: '2024-03-20T00:00:00Z',
    completed_at: null,
  },
];

// ─── Mock Quizzes ────────────────────────────────────────────────────────────
export const mockQuizzes: Record<string, Quiz[]> = {
  'course-1': [
    {
      id: 'quiz-1-1',
      lesson_id: 'lesson-1-1',
      course_id: 'course-1',
      title: 'React Fundamentals Quiz',
      time_limit: 15,
      max_attempts: 3,
      pass_score: 70,
      questions: [
        {
          id: 'q1',
          quiz_id: 'quiz-1-1',
          type: 'mcq',
          text: 'What is React?',
          options: ['A JavaScript framework', 'A JavaScript library', 'A programming language', 'A database'],
          correct: 'A JavaScript library',
          explanation: 'React is a JavaScript library for building user interfaces, maintained by Meta.',
          order_index: 0,
          points: 10,
        },
        {
          id: 'q2',
          quiz_id: 'quiz-1-1',
          type: 'mcq',
          text: 'What is JSX?',
          options: ['A CSS framework', 'A templating language', 'JavaScript XML', 'A database'],
          correct: 'JavaScript XML',
          explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in JavaScript.',
          order_index: 1,
          points: 10,
        },
        {
          id: 'q3',
          quiz_id: 'quiz-1-1',
          type: 'mcq',
          text: 'What method is used to render React elements?',
          options: ['render()', 'ReactDOM.render()', 'React.render()', 'display()'],
          correct: 'ReactDOM.render()',
          explanation: 'ReactDOM.render() is used to render React elements to the DOM.',
          order_index: 2,
          points: 10,
        },
      ],
      created_at: '2024-01-02T00:00:00Z',
    },
  ],
};

// ─── Mock Assignments ────────────────────────────────────────────────────────
export const mockAssignments: Record<string, Assignment[]> = {
  'course-1': [
    {
      id: 'assign-1-1',
      lesson_id: 'lesson-1-2',
      course_id: 'course-1',
      title: 'Build a Todo App',
      description: 'Create a simple todo application using React components and state.',
      due_date: '2024-02-01T23:59:59Z',
      due_at: '2024-02-01T23:59:59Z',
      max_score: 100,
      submission_type: 'both',
      allowed_types: ['pdf', 'docx', 'zip', 'image'],
      max_file_mb: 10,
      passing_score: 70,
      rubric: [
        { id: 'r1', assignment_id: 'assign-1-1', title: 'Functionality', description: 'App must allow adding, completing, and deleting todos', max_points: 40, position: 0 },
        { id: 'r2', assignment_id: 'assign-1-1', title: 'Code Quality', description: 'Clean, readable code with proper component structure', max_points: 30, position: 1 },
        { id: 'r3', assignment_id: 'assign-1-1', title: 'State Management', description: 'Proper use of React state and props', max_points: 30, position: 2 },
      ],
      created_at: '2024-01-03T00:00:00Z',
    },
  ],
};

// ─── Mock Submissions ────────────────────────────────────────────────────────
export const mockSubmissions: Submission[] = [
  {
    id: 'sub-1',
    assignment_id: 'assign-1-1',
    user_id: 'user-1',
    content: '<p>Here is my submission for the Todo app. It handles state correctly.</p>',
    file_urls: ['https://example.com/files/todo-app.zip'],
    status: 'submitted',
    grade: null,
    score: null,
    feedback: null,
    submitted_at: '2024-01-20T14:00:00Z',
    graded_at: null,
    graded_by: null,
  },
  {
    id: 'sub-2',
    assignment_id: 'assign-1-1',
    user_id: 'user-3', // let's pretend user-3 is also enrolled as a test
    content: '<p>My code is attached.</p>',
    file_urls: [],
    status: 'graded',
    grade: 85,
    score: 85,
    feedback: '<p>Good job, but state management could be optimized.</p>',
    submitted_at: '2024-01-18T10:00:00Z',
    graded_at: '2024-01-19T10:00:00Z',
    graded_by: 'user-2',
  }
];

// ─── Mock Grades ─────────────────────────────────────────────────────────────
export const mockGrades: Grade[] = [
  {
    id: 'grade-1',
    user_id: 'user-1',
    course_id: 'course-2',
    item_id: 'quiz-2-1',
    item_type: 'quiz',
    item_title: 'Python Basics Quiz',
    score: 92,
    max_score: 100,
    percentage: 92,
    graded_at: '2024-02-20T00:00:00Z',
  },
  {
    id: 'grade-2',
    user_id: 'user-1',
    course_id: 'course-1',
    item_id: 'quiz-1-1',
    item_type: 'quiz',
    item_title: 'React Fundamentals Quiz',
    score: 85,
    max_score: 100,
    percentage: 85,
    graded_at: '2024-01-25T00:00:00Z',
  },
];

// ─── Mock Certificates ────────────────────────────────────────────────────────
export const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    user_id: 'user-1',
    course_id: 'course-2',
    course: { id: 'course-2', title: 'Python for Data Science', instructor: mockCourses[1].instructor },
    issued_at: '2024-03-15T00:00:00Z',
    certificate_url: 'https://example.com/certificates/cert-1.pdf',
    pdf_url: 'https://example.com/certificates/cert-1.pdf',
    credential_id: 'CERT-2024-001',
  },
];

// ─── Mock Badges ──────────────────────────────────────────────────────────────
export const mockBadges: Badge[] = [
  {
    id: 'badge-1',
    name: 'Quick Learner',
    description: 'Completed first course within 7 days',
    icon_name: 'zap',
    criteria_type: 'COURSE_COMPLETED',
    criteria_value: 1,
    created_at: '2024-01-01T00:00:00Z',
    icon_url: '⚡',
    color: '#F59E0B',
    criteria: 'Complete any course within 7 days of enrollment',
  },
  {
    id: 'badge-2',
    name: 'Perfect Score',
    description: 'Achieved 100% on any quiz',
    icon_name: 'award',
    criteria_type: 'QUIZ_PERFECT_SCORE',
    criteria_value: 1,
    created_at: '2024-01-01T00:00:00Z',
    icon_url: '🏆',
    color: '#10B981',
    criteria: 'Score 100% on any quiz',
  },
  {
    id: 'badge-3',
    name: 'Consistent Learner',
    description: 'Studied for 7 consecutive days',
    icon_name: 'footprints',
    criteria_type: 'LESSONS_COMPLETED',
    criteria_value: 7,
    created_at: '2024-01-01T00:00:00Z',
    icon_url: '🔥',
    color: '#EF4444',
    criteria: 'Login and complete lessons for 7 consecutive days',
  },
  {
    id: 'badge-4',
    name: 'Course Master',
    description: 'Completed 5 courses',
    icon_name: 'graduation-cap',
    criteria_type: 'COURSE_COMPLETED',
    criteria_value: 5,
    created_at: '2024-01-01T00:00:00Z',
    icon_url: '👑',
    color: '#6366F1',
    criteria: 'Complete 5 courses',
  },
];

// ─── Mock User Badges ─────────────────────────────────────────────────────────
export const mockUserBadges: UserBadge[] = [
  {
    id: 'ub-1',
    user_id: 'user-1',
    badge_id: 'badge-1',
    earned_at: '2024-02-10T00:00:00Z',
    badge: mockBadges[0],
  },
  {
    id: 'ub-2',
    user_id: 'user-1',
    badge_id: 'badge-3',
    earned_at: '2024-03-25T00:00:00Z',
    badge: mockBadges[2],
  },
];

// ─── Mock Announcements ──────────────────────────────────────────────────────
export const mockAnnouncements: Announcement[] = [
  {
    id: 'announce-1',
    title: 'New Course: Advanced TypeScript',
    content: 'We are excited to announce our new Advanced TypeScript course. Enroll now to master TypeScript patterns!',
    author_id: 'user-3',
    target_roles: ['student', 'instructor'],
    course_id: null,
    is_published: true,
    published_at: '2024-04-10T00:00:00Z',
    author: { id: 'user-3', full_name: 'Admin User', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  },
  {
    id: 'announce-2',
    title: 'Platform Maintenance',
    content: 'The platform will be down for maintenance on Sunday from 2 AM to 6 AM EST.',
    author_id: 'user-3',
    target_roles: ['student', 'instructor', 'admin'],
    course_id: null,
    is_published: true,
    published_at: '2024-04-15T00:00:00Z',
    author: { id: 'user-3', full_name: 'Admin User', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  },
  {
    id: 'announce-3',
    title: 'React Course Update',
    content: 'New lessons have been added to the React Developer course. Check them out!',
    author_id: 'user-2',
    target_roles: ['student'],
    course_id: 'course-1',
    is_published: true,
    published_at: '2024-04-20T00:00:00Z',
    author: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  },
];

// ─── Mock Messages ────────────────────────────────────────────────────────────
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    sender_id: 'user-2',
    receiver_id: 'user-1',
    content: 'Great progress on the React course! Keep it up!',
    is_read: true,
    created_at: '2024-01-20T10:30:00Z',
    sender: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    receiver: { id: 'user-1', full_name: 'John Student', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
  },
  {
    id: 'msg-2',
    sender_id: 'user-1',
    receiver_id: 'user-2',
    content: 'Thank you! I really enjoyed the hooks lesson.',
    is_read: true,
    created_at: '2024-01-20T11:00:00Z',
    sender: { id: 'user-1', full_name: 'John Student', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
    receiver: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  },
  {
    id: 'msg-3',
    sender_id: 'user-2',
    receiver_id: 'user-1',
    content: 'Have you tried the assignment? Let me know if you need help.',
    is_read: false,
    created_at: '2024-01-25T15:00:00Z',
    sender: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    receiver: { id: 'user-1', full_name: 'John Student', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
  },
];

// ─── Mock Notifications ──────────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    title: 'New Message',
    message: 'You have a new message from Dr. Sarah Instructor',
    type: 'info',
    is_read: false,
    created_at: '2024-01-25T15:00:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    title: 'Course Completed',
    message: 'Congratulations! You completed Python for Data Science',
    type: 'success',
    is_read: true,
    created_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'user-1',
    title: 'Assignment Due',
    message: 'Build a Todo App is due in 3 days',
    type: 'warning',
    is_read: false,
    created_at: '2024-01-29T00:00:00Z',
  },
];

// ─── Mock Forum Threads ──────────────────────────────────────────────────────
export const mockForumThreads: ForumThread[] = [
  {
    id: 'thread-1',
    course_id: 'course-1',
    user_id: 'user-1',
    title: 'Question about useEffect cleanup',
    body: 'When should I use the cleanup function in useEffect? I am confused about when it runs.',
    is_pinned: true,
    is_locked: false,
    is_off_topic: false,
    upvote_count: 5,
    reply_count: 5,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    author: { id: 'user-1', full_name: 'John Student', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', role: 'student' },
  },
  {
    id: 'thread-2',
    course_id: 'course-1',
    user_id: 'user-1',
    title: 'Best practices for state management',
    body: 'What are the best practices for managing state in large React applications?',
    is_pinned: false,
    is_locked: false,
    is_off_topic: false,
    upvote_count: 3,
    reply_count: 3,
    created_at: '2024-01-20T14:00:00Z',
    updated_at: '2024-01-20T14:00:00Z',
    author: { id: 'user-1', full_name: 'John Student', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', role: 'student' },
  },
];

// ─── Mock Forum Replies ───────────────────────────────────────────────────────
export const mockForumReplies: ForumReply[] = [
  {
    id: 'reply-1',
    thread_id: 'thread-1',
    user_id: 'user-2',
    body: 'The cleanup function runs before the component unmounts and when dependencies change. Use it to clean up subscriptions, timers, etc.',
    parent_reply_id: null,
    is_accepted: false,
    upvote_count: 3,
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z',
    author: { id: 'user-2', full_name: 'Dr. Sarah Instructor', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', role: 'instructor' },
  },
  {
    id: 'reply-2',
    thread_id: 'thread-1',
    user_id: 'user-1',
    body: 'Thank you! That makes sense now.',
    parent_reply_id: null,
    is_accepted: false,
    upvote_count: 1,
    created_at: '2024-01-15T11:30:00Z',
    updated_at: '2024-01-15T11:30:00Z',
    author: { id: 'user-1', full_name: 'John Student', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', role: 'student' },
  },
];

// ─── Mock Audit Logs ─────────────────────────────────────────────────────────
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    user_id: 'user-3',
    action: 'user_created',
    entity_type: 'user',
    entity_id: 'user-new-1',
    metadata: { email: 'newuser@eduflow.com', role: 'student' },
    created_at: '2024-04-01T09:00:00Z',
    user: { id: 'user-3', full_name: 'Admin User', email: 'admin@eduflow.com' },
  },
  {
    id: 'audit-2',
    user_id: 'user-3',
    action: 'course_published',
    entity_type: 'course',
    entity_id: 'course-4',
    metadata: { title: 'Advanced TypeScript Patterns' },
    created_at: '2024-04-01T10:00:00Z',
    user: { id: 'user-3', full_name: 'Admin User', email: 'admin@eduflow.com' },
  },
  {
    id: 'audit-3',
    user_id: 'user-2',
    action: 'course_updated',
    entity_type: 'course',
    entity_id: 'course-1',
    metadata: { field: 'description' },
    created_at: '2024-04-02T11:00:00Z',
    user: { id: 'user-2', full_name: 'Dr. Sarah Instructor', email: 'instructor@eduflow.com' },
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────
export function getProfileById(id: string): Profile | undefined {
  return mockProfiles.find(p => p.id === id);
}

export function getCourseById(id: string): Course | undefined {
  return mockCourses.find(c => c.id === id);
}

export function getLessonsByCourseId(courseId: string): Lesson[] {
  return mockLessons[courseId] || [];
}

export function getModulesByCourseId(courseId: string): Module[] {
  return mockModules[courseId] || [];
}

export function getEnrollmentsByUserId(userId: string): Enrollment[] {
  return mockEnrollments.filter(e => e.user_id === userId);
}

export function getQuizzesByCourseId(courseId: string): Quiz[] {
  return mockQuizzes[courseId] || [];
}

export function getAssignmentsByCourseId(courseId: string): Assignment[] {
  return mockAssignments[courseId] || [];
}

export function getGradesByUserId(userId: string): Grade[] {
  return mockGrades.filter(g => g.user_id === userId);
}

export function getCertificatesByUserId(userId: string): Certificate[] {
  return mockCertificates.filter(c => c.user_id === userId);
}

export function getBadgesByUserId(userId: string): UserBadge[] {
  return mockUserBadges.filter(ub => ub.user_id === userId);
}

export function getAnnouncementsByRole(role: string): Announcement[] {
  return mockAnnouncements.filter(a => a.target_roles.includes(role as any));
}

export function getMessagesByUserId(userId: string): Message[] {
  return mockMessages.filter(m => m.sender_id === userId || m.receiver_id === userId);
}

export function getNotificationsByUserId(userId: string): Notification[] {
  return mockNotifications.filter(n => n.user_id === userId);
}

export function getForumThreadsByCourseId(courseId: string): ForumThread[] {
  return mockForumThreads.filter(t => t.course_id === courseId);
}

export function getForumRepliesByThreadId(threadId: string): ForumReply[] {
  return mockForumReplies.filter(r => r.thread_id === threadId);
}

export function getAllBadges(): Badge[] {
  return mockBadges;
}

export function getSubmissionsByInstructor(instructorId: string): Submission[] {
  // Mock logic: return submissions for assignments in courses owned by this instructor
  // For simplicity, just returning all mockSubmissions since user-2 owns course-1
  return mockSubmissions;
}