import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/store/adminStore';

export function ImpersonationBanner() {
  const { impersonating, endImpersonation } = useAdminStore();

  if (!impersonating) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-3 text-sm">
      <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
      <span className="text-amber-700 dark:text-amber-400">
        Viewing as <strong>{impersonating.name}</strong> — all actions are logged
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs border-amber-500/50 hover:bg-amber-500/20"
        onClick={endImpersonation}
      >
        Exit Impersonation
      </Button>
    </div>
  );
}
