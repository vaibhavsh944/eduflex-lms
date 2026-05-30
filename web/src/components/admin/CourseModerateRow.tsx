import { CheckCircle2, XCircle, Send, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
interface CourseModerateRowData {
  id: string;
  title: string;
  status: string;
  instructor_name?: string;
  rejection_reason?: string | null;
}

interface CourseModerateRowActions {
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onForcePublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPreview?: (id: string) => void;
}

interface CourseModerateRowProps {
  course: CourseModerateRowData;
  actions: CourseModerateRowActions;
}

const statusBadge = (status: string): { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string } => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
    draft: { variant: 'secondary', label: 'Draft' },
    pending_review: { variant: 'outline', label: 'Pending Review' },
    published: { variant: 'default', label: 'Published' },
    archived: { variant: 'secondary', label: 'Archived' },
    rejected: { variant: 'destructive', label: 'Rejected' },
    deleted: { variant: 'destructive', label: 'Deleted' },
  };
  return variants[status] || { variant: 'outline' as const, label: status };
};

export function CourseModerateRow({ course, actions }: CourseModerateRowProps) {
  const sb = statusBadge(course.status);
  const safePreview = actions.onPreview;
  const safeApprove = actions.onApprove;
  const safeReject = actions.onReject;
  const safeForcePublish = actions.onForcePublish;
  const safeUnpublish = actions.onUnpublish;
  const safeDelete = actions.onDelete;

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/20">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{course.title}</span>
          <Badge variant={sb.variant}>{sb.label}</Badge>
        </div>
        {course.instructor_name && (
          <p className="text-xs text-muted-foreground mt-0.5">by {course.instructor_name}</p>
        )}
        {course.rejection_reason && (
          <p className="text-xs text-destructive mt-1">
            Reason: {course.rejection_reason}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {safePreview && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { safePreview(course.id); }} title="Preview">
            <Eye className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Send className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {course.status !== 'published' && safeApprove && (
              <DropdownMenuItem onClick={() => { safeApprove(course.id); }}>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Approve & Publish
              </DropdownMenuItem>
            )}
            {course.status === 'pending_review' && safeReject && (
              <DropdownMenuItem onClick={() => { safeReject(course.id); }}>
                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                Reject
              </DropdownMenuItem>
            )}
            {course.status !== 'published' && course.status !== 'deleted' && safeForcePublish && (
              <DropdownMenuItem onClick={() => { safeForcePublish(course.id); }}>
                Force Publish
              </DropdownMenuItem>
            )}
            {course.status === 'published' && safeUnpublish && (
              <DropdownMenuItem onClick={() => { safeUnpublish(course.id); }}>
                Unpublish
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {course.status !== 'deleted' && safeDelete && (
              <DropdownMenuItem onClick={() => { safeDelete(course.id); }} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
