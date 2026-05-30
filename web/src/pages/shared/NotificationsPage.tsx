import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { EmptyNotificationsState } from '@/components/notifications/EmptyNotificationsState';
import { SkeletonPage } from '@/components/common/SkeletonPage';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/queries/useNotifications';
import { SEO } from '@/components/shared/SEO';
import { CheckCheck } from 'lucide-react';

export function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data: notifications, isLoading, isError, error } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  if (isLoading) return <SkeletonPage />;
  if (isError) return <ErrorState title="Failed to load notifications" message={error?.message} />;

  const filteredNotifications = notifications?.filter(n => {
    if (filter === 'unread') return !n.read_at;
    return true;
  }) || [];

  const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

  return (
    <>
      <SEO title="Notifications | EduFlow" />
      <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <PageHeader title="Notifications" description="Stay updated on your learning journey." />
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            className="gap-2 shrink-0 self-start sm:self-auto"
            onClick={() => markAllRead()}
            disabled={isMarkingAll}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <Button 
          variant={filter === 'all' ? 'default' : 'secondary'} 
          onClick={() => setFilter('all')}
          className="rounded-full"
        >
          All
        </Button>
        <Button 
          variant={filter === 'unread' ? 'default' : 'secondary'} 
          onClick={() => setFilter('unread')}
          className="rounded-full"
        >
          Unread {unreadCount > 0 && <span className="ml-1 opacity-70">({unreadCount})</span>}
        </Button>
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyNotificationsState />
      ) : (
        <div className="bg-card rounded-xl border shadow-sm divide-y">
          {filteredNotifications.map((notif) => (
            <NotificationItem 
              key={notif.id} 
              notification={notif} 
              onRead={(id) => markRead(id)} 
            />
          ))}
        </div>
      )}
    </div>
    </>
  );
}
