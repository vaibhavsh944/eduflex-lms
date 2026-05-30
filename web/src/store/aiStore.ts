import { create } from 'zustand';

interface AiState {
  tutorOpen: boolean;
  tutorLessonId: string | null;
  conversations: Record<string, { role: string; content: string }[]>;
  isStreaming: boolean;
  streamedResponse: string;
  openTutor: (lessonId: string) => void;
  closeTutor: () => void;
  appendMessage: (lessonId: string, message: { role: string; content: string }) => void;
  setConversation: (lessonId: string, messages: { role: string; content: string }[]) => void;
  setStreaming: (v: boolean) => void;
  setStreamedResponse: (text: string) => void;
  clearConversation: (lessonId: string) => void;
}

export const useAiStore = create<AiState>((set) => ({
  tutorOpen: false,
  tutorLessonId: null,
  conversations: {},
  isStreaming: false,
  streamedResponse: '',
  openTutor: (lessonId) => set({ tutorOpen: true, tutorLessonId: lessonId }),
  closeTutor: () => set({ tutorOpen: false, tutorLessonId: null, streamedResponse: '', isStreaming: false }),
  appendMessage: (lessonId, message) => set((state) => ({
    conversations: {
      ...state.conversations,
      [lessonId]: [...(state.conversations[lessonId] ?? []), message],
    },
  })),
  setConversation: (lessonId, messages) => set((state) => ({
    conversations: { ...state.conversations, [lessonId]: messages },
  })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamedResponse: (streamedResponse) => set({ streamedResponse }),
  clearConversation: (lessonId) => set((state) => ({
    conversations: { ...state.conversations, [lessonId]: [] },
  })),
}));
