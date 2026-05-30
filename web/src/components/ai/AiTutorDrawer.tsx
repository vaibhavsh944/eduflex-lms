import { useEffect, useRef } from 'react';
import { X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { useAiStore } from '@/store/aiStore';
import { useStream } from '@/hooks/useStream';
import { useAuthStore } from '@/store/authStore';

interface AiTutorDrawerProps {
  lessonId: string;
  courseId: string;
}

export function AiTutorDrawer({ lessonId, courseId }: AiTutorDrawerProps) {
  const userId = useAuthStore(s => s.user?.id);
  const { closeTutor, conversations, appendMessage, setConversation, clearConversation } = useAiStore();
  const { streamedText, isStreaming, startStream } = useStream();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conversations[lessonId] ?? [];
  const allMessages = isStreaming
    ? [...messages, { role: 'assistant' as const, content: streamedText || '...' }]
    : messages;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages.length, streamedText]);

  useEffect(() => {
    if (messages.length === 0) {
      appendMessage(lessonId, { role: 'assistant', content: "Hi! I'm your AI Tutor for this lesson. Ask me anything." });
    }
  }, [lessonId]);

  const handleSend = async () => {
    const input = inputRef.current;
    if (!input || !input.value.trim() || isStreaming || !userId) return;
    const userMsg = input.value.trim();
    input.value = '';

    appendMessage(lessonId, { role: 'user', content: userMsg });
    const updatedMessages = [...messages, { role: 'user' as const, content: userMsg }];

    await startStream(
      'ai-chat',
      { user_id: userId, messages: updatedMessages, lesson_id: lessonId, course_id: courseId },
      (fullText) => {
        appendMessage(lessonId, { role: 'assistant', content: fullText });
      }
    );
  };

  const handleClear = () => clearConversation(lessonId);

  return (
    <div className="fixed right-0 top-0 z-50 flex h-full w-[380px] flex-col border-l bg-background shadow-xl max-sm:w-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Tutor</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleClear}>Clear</Button>
          <Button variant="ghost" size="icon" onClick={closeTutor}><X className="h-4 w-4" /></Button>
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 p-4">
        <div className="space-y-4">
          {allMessages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {isStreaming && !streamedText && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask anything about this lesson…"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            disabled={isStreaming}
          />
          <Button size="sm" onClick={handleSend} disabled={isStreaming}>Send</Button>
        </div>
      </div>
    </div>
  );
}
