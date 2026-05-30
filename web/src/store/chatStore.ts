import { create } from 'zustand';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  activeConversationId: string | null;
  isTyping: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

let messageId = 0;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeConversationId: null,
  isTyping: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${++messageId}`,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
  setTyping: (isTyping) => set({ isTyping }),
  clearMessages: () => set({ messages: [], activeConversationId: null }),
}));