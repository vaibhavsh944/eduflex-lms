import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/shared/SEO';
import { ROUTES } from '@/lib/constants';

export function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found | EduFlow" />
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl">Page not found</p>
      <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Link to={ROUTES.HOME} className="mt-6"><Button>Go Home</Button></Link>
    </div>
    </>
  );
}
