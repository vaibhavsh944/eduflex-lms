import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">EduFlow</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering learners worldwide with quality education.
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={ROUTES.CATALOG} className="hover:text-primary">Browse Courses</Link></li>
              <li><Link to={ROUTES.SIGNUP} className="hover:text-primary">Become an Instructor</Link></li>
              <li><Link to={ROUTES.CATALOG} className="hover:text-primary">Enterprise</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={ROUTES.HOME} className="hover:text-primary">About Us</Link></li>
              <li><a href="https://github.com/eduflow" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Careers</a></li>
              <li><a href="https://github.com/eduflow" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Blog</a></li>
              <li><a href="mailto:support@eduflow.app" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Connect</h3>
            <div className="flex gap-4">
              <a href="https://github.com/eduflow" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="GitHub">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>
              </a>
              <a href="mailto:support@eduflow.app" className="text-muted-foreground hover:text-primary" aria-label="Email">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
              <a href="https://twitter.com/eduflow" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Twitter">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
