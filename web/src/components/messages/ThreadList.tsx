import { useMessageThreads } from '@/hooks/queries/useMessages';
import { ThreadListItem } from '@/components/messages/ThreadListItem';
import { useMessageStore } from '@/store/messageStore';
import { Skeleton } from '@/components/ui/skeleton';

export function ThreadList() {
  const { data: threads, isLoading } = useMessageThreads();
  const activeThreadId = useMessageStore(state => state.activeThreadId);
  const setActiveThread = useMessageStore(state => state.setActiveThread);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!threads || threads.length === 0) {
    return <div className="p-8 text-center text-sm text-muted-foreground">No conversations found.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {threads.map(thread => (
        <ThreadListItem 
          key={thread.id} 
          thread={thread} 
          isActive={activeThreadId === thread.id} 
          onClick={() => setActiveThread(thread.id)} 
        />
      ))}
    </div>
  );
}
