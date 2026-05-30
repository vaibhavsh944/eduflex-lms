import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useNotificationStore } from '@/store/notificationStore';
import { useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/queries/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const previewNotifications = useNotificationStore(state => state.previewNotifications);
  
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-md border bg-popover shadow-md z-50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:underline"
                onClick={() => markAllRead()}
                disabled={isMarkingAll}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            <div className="flex flex-col p-2 gap-1">
              {previewNotifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <Bell className="h-8 w-8 mb-3 opacity-20" />
                  <p>No new notifications</p>
                </div>
              ) : (
                previewNotifications.map((notif) => (
                  <NotificationItem 
                    key={notif.id} 
                    notification={notif} 
                    onRead={(id) => markRead(id)} 
                  />
                ))
              )}
            </div>
          </div>
          
          <div className="border-t p-2">
            <Link to={ROUTES.NOTIFICATIONS} onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full text-sm h-9">
                View all notifications
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
