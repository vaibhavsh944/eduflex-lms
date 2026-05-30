import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, ShieldCheck, GraduationCap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { ROUTES, ROLE_DASHBOARDS } from '@/lib/constants';
import { cn, getInitials } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

const ROLE_META: Record<UserRole, { label: string; icon: typeof User; route: string }> = {
  student: { label: 'Student Portal', icon: GraduationCap, route: ROUTES.STUDENT_DASHBOARD },
  instructor: { label: 'Instructor Portal', icon: BookOpen, route: ROUTES.INSTRUCTOR_DASHBOARD },
  admin: { label: 'Admin Portal', icon: ShieldCheck, route: ROUTES.ADMIN_DASHBOARD },
};

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  if (!user) return null;

  const currentRole = user.role;
  const settingsRoute = currentRole === 'admin' ? ROUTES.ADMIN_SETTINGS : ROUTES.PROFILE_EDIT;

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => { setIsOpen(!isOpen); setShowRoleSwitcher(false); }} className="relative">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {getInitials(user.full_name)}
          </div>
        )}
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border bg-background/95 backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info */}
          <div className="border-b px-4 py-3">
            <div className="font-semibold">{user.full_name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
              {React.createElement(ROLE_META[currentRole].icon, { className: 'h-3 w-3' })}
              {currentRole}
            </div>
          </div>

          {/* Portal shortcuts */}
          <div className="border-b py-1.5">
            <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Portals</div>
            {(['student', 'instructor', 'admin'] as UserRole[]).map(role => {
              const meta = ROLE_META[role];
              const isCurrentPortal = role === currentRole;
              return (
                <button
                  key={role}
                  onClick={() => {
                    navigate(meta.route);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
                    isCurrentPortal
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <meta.icon className="h-4 w-4" />
                  {meta.label}
                  {isCurrentPortal && <span className="ml-auto text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5">Active</span>}
                </button>
              );
            })}
          </div>

          {/* Standard links */}
          <div className="py-1.5">
            <button
              onClick={() => { navigate(ROUTES.PROFILE); setIsOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => { navigate(settingsRoute); setIsOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t py-1.5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Need React import for createElement
import React from 'react';
