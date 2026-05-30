import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, BarChart3, Users, Settings, FileText, Award, Badge, Bell, MessageSquare, Trophy, User, Search, Megaphone, Cog, Shield, CreditCard, DollarSign, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES, NAV_LABELS } from '@/lib/constants';

interface SidebarProps {
  role: 'student' | 'instructor' | 'admin';
}

const studentLinks = [
  { to: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard, label: NAV_LABELS.student.dashboard },
  { to: ROUTES.STUDENT_COURSES, icon: BookOpen, label: NAV_LABELS.student.myCourses },
  { to: ROUTES.STUDENT_GRADES, icon: GraduationCap, label: NAV_LABELS.student.grades },
  { to: ROUTES.STUDENT_PROGRESS, icon: BarChart3, label: NAV_LABELS.student.progress },
  { to: ROUTES.STUDENT_CERTIFICATES, icon: Award, label: NAV_LABELS.student.certificates },
  { to: ROUTES.STUDENT_BADGES, icon: Badge, label: NAV_LABELS.student.badges },
  { to: ROUTES.STUDENT_ANNOUNCEMENTS, icon: Megaphone, label: NAV_LABELS.student.announcements },
  { to: ROUTES.PROFILE_PAYMENTS, icon: CreditCard, label: NAV_LABELS.student.payments },
];

const instructorLinks = [
  { to: ROUTES.INSTRUCTOR_DASHBOARD, icon: LayoutDashboard, label: NAV_LABELS.instructor.dashboard },
  { to: ROUTES.INSTRUCTOR_COURSES, icon: BookOpen, label: NAV_LABELS.instructor.myCourses },
  { to: ROUTES.INSTRUCTOR_NEW_COURSE, icon: Settings, label: NAV_LABELS.instructor.createCourse },
  { to: ROUTES.INSTRUCTOR_REVENUE, icon: DollarSign, label: NAV_LABELS.instructor.revenue },
];

const adminLinks = [
  { to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, label: NAV_LABELS.admin.dashboard },
  { to: ROUTES.ADMIN_USERS, icon: Users, label: NAV_LABELS.admin.users },
  { to: ROUTES.ADMIN_COURSES, icon: BookOpen, label: NAV_LABELS.admin.courses },
  { to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3, label: NAV_LABELS.admin.analytics },
  { to: ROUTES.ADMIN_REPORTS, icon: FileText, label: NAV_LABELS.admin.reports },
  { to: ROUTES.ADMIN_ANNOUNCEMENTS, icon: Megaphone, label: NAV_LABELS.admin.announcements },
  { to: ROUTES.ADMIN_SETTINGS, icon: Settings, label: NAV_LABELS.admin.settings },
  { to: ROUTES.ADMIN_AUDIT_LOGS, icon: Shield, label: NAV_LABELS.admin.auditLogs },
  { to: ROUTES.ADMIN_COUPONS, icon: Tag, label: NAV_LABELS.admin.coupons },
  { to: ROUTES.ADMIN_REVENUE, icon: DollarSign, label: NAV_LABELS.admin.revenue },
];

const sharedLinks = [
  { to: ROUTES.MESSAGES, icon: MessageSquare, label: NAV_LABELS.shared.messages },
  { to: ROUTES.NOTIFICATIONS, icon: Bell, label: NAV_LABELS.shared.notifications },
  { to: ROUTES.LEADERBOARD, icon: Trophy, label: NAV_LABELS.shared.leaderboard },
  { to: ROUTES.PROFILE, icon: User, label: NAV_LABELS.shared.profile },
  { to: ROUTES.SEARCH, icon: Search, label: NAV_LABELS.shared.search },
];

export function Sidebar({ role }: SidebarProps) {
  const roleLinks = role === 'student' ? studentLinks : role === 'instructor' ? instructorLinks : adminLinks;

  return (
    <aside className="w-64 border-r bg-card px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">EduFlow</h1>
      </div>
      <nav className="space-y-1">
        <div className="mb-4 text-xs font-semibold uppercase text-muted-foreground">Main</div>
        {roleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
        <div className="my-4 border-t" />
        <div className="mb-4 text-xs font-semibold uppercase text-muted-foreground">Shared</div>
        {sharedLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
