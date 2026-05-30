import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuthStore } from '@/store/authStore';

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const adminLink = isAuthenticated && user?.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.ADMIN_LOGIN;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">EduFlow</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to={ROUTES.CATALOG} className="text-sm font-medium hover:text-primary">
            Courses
          </Link>
          <Link to={ROUTES.LOGIN} className="text-sm font-medium hover:text-primary">
            Sign In
          </Link>
          <Link to={adminLink} className="text-sm font-medium text-muted-foreground hover:text-primary">
            Admin
          </Link>
          <Link to={ROUTES.SIGNUP}>
            <Button>Get Started</Button>
          </Link>
          <ThemeToggle />
        </nav>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-t bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link to={ROUTES.CATALOG} className="text-sm font-medium" onClick={() => setIsOpen(false)}>
              Courses
            </Link>
            <Link to={ROUTES.LOGIN} className="text-sm font-medium" onClick={() => setIsOpen(false)}>
              Sign In
            </Link>
            <Link to={adminLink} className="text-sm font-medium text-muted-foreground" onClick={() => setIsOpen(false)}>
              Admin
            </Link>
            <Link to={ROUTES.SIGNUP} onClick={() => setIsOpen(false)}>
              <Button className="w-full">Get Started</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
