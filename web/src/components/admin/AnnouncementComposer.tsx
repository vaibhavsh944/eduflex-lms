import { useState } from 'react';
import { Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
interface AnnouncementComposerProps {
  onSend: (data: {
    title: string;
    body: string;
    targetType: 'all' | 'role' | 'course';
    targetRole?: string;
    targetCourseId?: string;
    scheduledAt?: string;
    sendPush: boolean;
    sendEmail: boolean;
  }) => void;
  isSending?: boolean;
}

export function AnnouncementComposer({ onSend, isSending }: AnnouncementComposerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'role' | 'course'>('all');
  const [targetRole, setTargetRole] = useState('student');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sendPush, setSendPush] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  const isFormValid = title.trim().length > 0 && body.trim().length > 0;

  const handleSubmit = () => {
    if (!isFormValid) return;
    onSend({
      title: title.trim(),
      body,
      targetType,
      targetRole: targetType === 'role' ? targetRole : undefined,
      targetCourseId: targetType === 'course' ? targetCourseId : undefined,
      scheduledAt: scheduledAt || undefined,
      sendPush,
      sendEmail,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="ann-title">Title</Label>
        <Input
          id="ann-title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); }}
          placeholder="Announcement title..."
        />
      </div>

      <div className="space-y-2">
        <Label>Body</Label>
        <TipTapEditor
          content={body}
          onChange={setBody}
          placeholder="Write your announcement here..."
          minHeight={200}
        />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <Label>Target Audience</Label>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="target-all"
              name="target"
              checked={targetType === 'all'}
              onChange={() => { setTargetType('all'); }}
              className="h-4 w-4"
            />
            <Label htmlFor="target-all" className="text-sm font-normal">All Users</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="target-role"
              name="target"
              checked={targetType === 'role'}
              onChange={() => { setTargetType('role'); }}
              className="h-4 w-4"
            />
            <Label htmlFor="target-role" className="text-sm font-normal">Specific Role</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="target-course"
              name="target"
              checked={targetType === 'course'}
              onChange={() => { setTargetType('course'); }}
              className="h-4 w-4"
            />
            <Label htmlFor="target-course" className="text-sm font-normal">Specific Course</Label>
          </div>
        </div>

        {targetType === 'role' && (
          <Select value={targetRole} onValueChange={(v) => { if (v) setTargetRole(v); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="instructor">Instructors</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        )}

        {targetType === 'course' && (
          <Input
            value={targetCourseId}
            onChange={(e) => { setTargetCourseId(e.target.value); }}
            placeholder="Enter course ID..."
          />
        )}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <Label>Delivery Options</Label>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-normal">Send as push notification</Label>
            <p className="text-xs text-muted-foreground">Mobile push via Expo</p>
          </div>
          <Switch checked={sendPush} onCheckedChange={(v) => { setSendPush(v); }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-normal">Send as email</Label>
            <p className="text-xs text-muted-foreground">Via Resend API</p>
          </div>
          <Switch checked={sendEmail} onCheckedChange={(v) => { setSendEmail(v); }} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ann-schedule">Schedule (optional)</Label>
        <Input
          id="ann-schedule"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => { setScheduledAt(e.target.value); }}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to send immediately
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isFormValid || isSending}
        className="w-full gap-2"
      >
        {scheduledAt ? (
          <><Calendar className="h-4 w-4" /> Schedule Announcement</>
        ) : (
          <><Send className="h-4 w-4" /> {isSending ? 'Sending...' : 'Send Announcement'}</>
        )}
      </Button>
    </div>
  );
}
