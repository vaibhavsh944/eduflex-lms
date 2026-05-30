import { cn } from '@/lib/utils';
import { useMessageStore } from '@/store/messageStore';

export function OnlinePresenceDot({ userId, lastSeenAt, className }: { userId: string; lastSeenAt: string | null; className?: string }) {
  const storeOnlineStatus = useMessageStore(state => state.onlineStatus[userId]);
  
  // Use the store status if it's newer, otherwise fallback to the database last_seen_at
  const latestSeenAt = storeOnlineStatus || lastSeenAt;
  
  // Consider online if seen within last 10 minutes
  let isOnline = false;
  if (latestSeenAt) {
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    isOnline = new Date(latestSeenAt) > tenMinsAgo;
  }

  return (
    <div 
      className={cn(
        "h-3 w-3 rounded-full border-2 border-background",
        isOnline ? "bg-green-500" : "bg-muted",
        className
      )}
      title={isOnline ? "Online" : "Offline"}
    />
  );
}
