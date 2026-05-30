import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageSquare, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES, NAV_LABELS } from '@/lib/constants';

interface MobileBottomNavProps {
  role: 'student' | 'instructor' | 'admin';
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const links = [
    { to: role === 'student' ? ROUTES.STUDENT_DASHBOARD : role === 'instructor' ? ROUTES.INSTRUCTOR_DASHBOARD : ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Home' },
    { to: role === 'student' ? ROUTES.STUDENT_COURSES : role === 'instructor' ? ROUTES.INSTRUCTOR_COURSES : ROUTES.ADMIN_COURSES, icon: BookOpen, label: 'Courses' },
    { to: ROUTES.MESSAGES, icon: MessageSquare, label: 'Messages' },
    { to: ROUTES.NOTIFICATIONS, icon: Bell, label: 'Alerts' },
    { to: ROUTES.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center p-2 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <link.icon className="h-5 w-5" />
            <span className="mt-1">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
