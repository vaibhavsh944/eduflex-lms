import { create } from 'zustand'

interface CoursePlayerState {
  // Navigation
  activeCourseId: string | null
  activeLessonId: string | null
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  // Notes panel
  notesPanelOpen: boolean
  // Actions
  setActiveCourse: (courseId: string) => void
  setActiveLesson: (lessonId: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleNotesPanel: () => void
  reset: () => void
}

export const useCoursePlayerStore = create<CoursePlayerState>((set) => ({
  activeCourseId: null,
  activeLessonId: null,
  sidebarOpen: true,
  sidebarCollapsed: false,
  notesPanelOpen: false,
  setActiveCourse: (courseId) => set({ activeCourseId: courseId }),
  setActiveLesson: (lessonId) => set({ activeLessonId: lessonId }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleNotesPanel: () => set((s) => ({ notesPanelOpen: !s.notesPanelOpen })),
  reset: () => set({ activeCourseId: null, activeLessonId: null, sidebarOpen: true, notesPanelOpen: false }),
}))