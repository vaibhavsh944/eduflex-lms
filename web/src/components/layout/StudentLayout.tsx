import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';
import { useMobile } from '@/hooks/useMediaQuery';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { useMessageRealtime } from '@/hooks/realtime/useMessageRealtime';
import { useNotificationRealtime } from '@/hooks/realtime/useNotificationRealtime';
import { usePresenceHeartbeat } from '@/hooks/realtime/usePresenceHeartbeat';
import { useLessonProgressRealtime } from '@/hooks/realtime/useLessonProgressRealtime';
import { SkipToMainContent } from '@/components/common/SkipToMainContent';

export function StudentLayout() {
  const isMobile = useMobile();
  useMessageRealtime();
  useNotificationRealtime();
  usePresenceHeartbeat();
  useLessonProgressRealtime();

  return (
    <div className="flex min-h-screen">
      <SkipToMainContent />
      {!isMobile && <Sidebar role="student" />}
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      {isMobile && <MobileBottomNav role="student" />}
    </div>
  );
}
