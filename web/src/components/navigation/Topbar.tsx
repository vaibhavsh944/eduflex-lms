import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ProfileDropdown } from '@/components/navigation/ProfileDropdown';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';

export function Topbar() {
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const totalUnreadMessages = useMessageStore(state => state.totalUnread);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link to={user?.role === 'student' ? ROUTES.STUDENT_DASHBOARD : user?.role === 'instructor' ? ROUTES.INSTRUCTOR_DASHBOARD : ROUTES.ADMIN_DASHBOARD} className="text-xl font-bold text-primary md:hidden">
            EduFlow
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground hover:bg-muted md:w-64 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline-flex ml-auto items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          <ThemeToggle />
          
          <Link to={ROUTES.MESSAGES} className="relative p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors">
            <MessageSquare className="h-5 w-5" />
            {totalUnreadMessages > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
              </span>
            )}
          </Link>

          <NotificationBell />
          <ProfileDropdown />
        </div>
      </header>

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

