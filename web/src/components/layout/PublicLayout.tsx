import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '@/components/navigation/PublicNavbar';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { SkipToMainContent } from '@/components/common/SkipToMainContent';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToMainContent />
      <PublicNavbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
