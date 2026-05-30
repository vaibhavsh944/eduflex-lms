import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/shared/SEO';
import { ROUTES } from '@/lib/constants';

export function ForbiddenPage() {
  return (
    <>
      <SEO title="Access Denied | EduFlow" />
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold">403</h1>
      <p className="mt-4 text-xl">Access Denied</p>
      <p className="mt-2 text-muted-foreground">You don't have permission to access this page.</p>
      <Link to={ROUTES.HOME} className="mt-6"><Button>Go Home</Button></Link>
    </div>
    </>
  );
}
