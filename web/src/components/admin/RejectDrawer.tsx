import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RejectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle?: string;
  onReject: (reason: string) => void;
  isSubmitting?: boolean;
}

export function RejectDrawer({
  open,
  onOpenChange,
  courseTitle,
  onReject,
  isSubmitting,
}: RejectDrawerProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onReject(reason.trim());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>Reject Course</SheetTitle>
          <SheetDescription>
            {courseTitle
              ? `Provide a reason for rejecting "${courseTitle}". The instructor will be notified.`
              : 'Provide a reason for rejecting this course. The instructor will be notified.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Rejection Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); }}
              placeholder="Explain why this course is being rejected..."
              rows={6}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { onOpenChange(false); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => { handleSubmit(); }}
              disabled={!reason.trim() || isSubmitting}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Course'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
