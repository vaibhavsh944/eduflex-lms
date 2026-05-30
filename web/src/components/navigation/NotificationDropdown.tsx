import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useNotifications, useMarkAllNotificationsRead } from '@/hooks/queries/useNotifications';
import { useNotificationStore } from '@/store/notificationStore';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const previewNotifications = useNotificationStore((s) => s.previewNotifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const displayNotifications = previewNotifications.length > 0 ? previewNotifications : (notifications?.slice(0, 5) ?? []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              displayNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn('border-b px-4 py-3 hover:bg-muted', !notif.read_at && 'bg-muted/50')}
                >
                  <div className="font-medium text-sm">{notif.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{notif.body?.replace(/<[^>]*>/g, '')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notif.created_at)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
