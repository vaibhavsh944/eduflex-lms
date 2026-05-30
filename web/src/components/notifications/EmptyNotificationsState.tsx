import { Bell } from 'lucide-react';

export function EmptyNotificationsState() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-xl border border-dashed">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Bell className="h-8 w-8 text-primary opacity-50" />
      </div>
      <h3 className="text-xl font-bold mb-2">You're all caught up!</h3>
      <p className="text-muted-foreground max-w-sm">
        No new notifications to display. When activity happens in your courses or someone messages you, it will appear here.
      </p>
    </div>
  );
}
