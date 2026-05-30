import { useEffect, useRef } from 'react';
import { useThreadMessages, useMarkThreadRead } from '@/hooks/queries/useMessages';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { useAuthStore } from '@/store/authStore';
import type { MessageThread } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessageStore } from '@/store/messageStore';

interface MessageThreadProps {
  thread: MessageThread;
}

export function MessageThreadView({ thread }: MessageThreadProps) {
  const { data: messages, isLoading } = useThreadMessages(thread.id);
  const { mutate: markRead } = useMarkThreadRead();
  const { user } = useAuthStore();
  const setActiveThread = useMessageStore(state => state.setActiveThread);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark read when opening or when new messages arrive
  useEffect(() => {
    if (thread.has_unread) {
      markRead(thread.id);
    }
  }, [thread.id, thread.has_unread, markRead, messages?.length]);

  // Scroll to bottom on load and on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const otherUser = thread.other_user;
  const isUserA = thread.user_a_id === user?.id;
  const myReadAt = isUserA ? thread.user_a_read_at : thread.user_b_read_at;
  const otherReadAt = isUserA ? thread.user_b_read_at : thread.user_a_read_at;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-16 shrink-0 border-b flex items-center px-4 gap-3 bg-card">
        <Button variant="ghost" size="icon" className="md:hidden -ml-2 shrink-0" onClick={() => setActiveThread(null)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatar_url || undefined} />
          <AvatarFallback>{otherUser.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{otherUser.full_name}</div>
          <div className="text-xs text-muted-foreground capitalize">{otherUser.role}</div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <div className={`space-y-2 ${i % 2 === 0 ? 'order-2' : ''}`}>
                  <Skeleton className={`h-8 ${i % 2 === 0 ? 'w-40' : 'w-32'} rounded-lg`} />
                  <Skeleton className={`h-8 ${i % 2 === 0 ? 'w-24' : 'w-48'} rounded-lg`} />
                </div>
              </div>
            ))}
          </div>
        ) : messages?.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Say hi to start the conversation!
          </div>
        ) : (
          messages?.map((msg, idx) => {
            const isOwn = msg.sender_id === user?.id;
            const isRead = isOwn && otherReadAt ? new Date(msg.sent_at) <= new Date(otherReadAt) : false;
            
            // Only show avatar if it's not our own message and it's the first in a sequence
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showAvatar = !isOwn && (!prevMsg || prevMsg.sender_id !== msg.sender_id);

            return (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isOwn={isOwn} 
                isRead={isRead} 
                showAvatar={showAvatar} 
              />
            );
          })
        )}
      </div>

      {/* Composer */}
      <MessageComposer threadId={thread.id} />
    </div>
  );
}
