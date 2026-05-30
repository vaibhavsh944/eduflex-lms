import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES, ROLE_DASHBOARDS } from '@/lib/constants';
import { BookOpen, Star, Users, Quote } from 'lucide-react';

export function AuthLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated && location.pathname !== ROUTES.ADMIN_LOGIN) {
    const target = user ? ROLE_DASHBOARDS[user.role] || ROUTES.STUDENT_DASHBOARD : ROUTES.STUDENT_DASHBOARD;
    return <Navigate to={target} replace />;
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-[45%] bg-brand-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold text-white">EduFlow</h1>
          <p className="text-brand-200 text-lg mt-2">Learn without limits.</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 animate-float">
            <div className="w-12 h-12 rounded-xl bg-brand-500/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-brand-300" />
            </div>
            <div>
              <h4 className="text-white font-semibold">React Masterclass</h4>
              <p className="text-brand-300 text-sm mt-1">12 modules · 48 lessons</p>
              <div className="flex items-center gap-1 mt-1">
                {Array(5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 animate-float-delayed ml-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Data Science Pro</h4>
              <p className="text-brand-300 text-sm mt-1">2,400+ students enrolled</p>
              <div className="flex items-center gap-1 mt-1">
                {Array(5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 animate-float-delayed-2 ml-16">
            <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h4 className="text-white font-semibold">UI/UX Design</h4>
              <p className="text-brand-300 text-sm mt-1">4.9★ average rating</p>
              <div className="flex items-center gap-1 mt-1">
                {Array(5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <Quote className="w-8 h-8 text-brand-400 mb-2" />
          <p className="text-brand-200 text-sm italic leading-relaxed">
            "EduFlow transformed the way I learn. The interactive courses and hands-on projects helped me land my dream job."
          </p>
          <p className="text-white text-sm font-semibold mt-3">— Priya S., Full-Stack Developer</p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground">EduFlow</h1>
            <p className="text-muted-foreground text-sm mt-1">Learn without limits.</p>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
