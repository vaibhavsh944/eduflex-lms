import type { ProfileExtended, NotificationPreferences } from '@/lib/types';
import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function NotificationPreferencesForm({ profile }: { profile: ProfileExtended }) {
  const { mutate: updateProfile } = useUpdateProfile();
  
  const prefs = profile.notification_preferences;

  const handleToggle = (key: keyof NotificationPreferences) => (checked: boolean) => {
    updateProfile({ 
      userId: profile.id, 
      data: {
        notification_preferences: {
          ...prefs,
          [key]: checked,
        }
      } 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified about activity in EduFlow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div>
          <h3 className="text-sm font-semibold mb-4 text-primary">In-App Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="inapp_new_message" checked={prefs.inapp_new_message} onCheckedChange={handleToggle('inapp_new_message')} />
              <Label htmlFor="inapp_new_message" className="font-normal cursor-pointer">Direct messages</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="inapp_assignment_graded" checked={prefs.inapp_assignment_graded} onCheckedChange={handleToggle('inapp_assignment_graded')} />
              <Label htmlFor="inapp_assignment_graded" className="font-normal cursor-pointer">Assignment grades & feedback</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="inapp_quiz_results" checked={prefs.inapp_quiz_results} onCheckedChange={handleToggle('inapp_quiz_results')} />
              <Label htmlFor="inapp_quiz_results" className="font-normal cursor-pointer">Quiz results</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="inapp_announcements" checked={prefs.inapp_announcements} onCheckedChange={handleToggle('inapp_announcements')} />
              <Label htmlFor="inapp_announcements" className="font-normal cursor-pointer">Course announcements</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="inapp_deadline_reminders" checked={prefs.inapp_deadline_reminders} onCheckedChange={handleToggle('inapp_deadline_reminders')} />
              <Label htmlFor="inapp_deadline_reminders" className="font-normal cursor-pointer">Deadline reminders</Label>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-4 text-primary">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="email_new_message" checked={prefs.email_new_message} onCheckedChange={handleToggle('email_new_message')} />
              <Label htmlFor="email_new_message" className="font-normal cursor-pointer">Direct messages</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email_assignment_graded" checked={prefs.email_assignment_graded} onCheckedChange={handleToggle('email_assignment_graded')} />
              <Label htmlFor="email_assignment_graded" className="font-normal cursor-pointer">Assignment grades & feedback</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email_quiz_results" checked={prefs.email_quiz_results} onCheckedChange={handleToggle('email_quiz_results')} />
              <Label htmlFor="email_quiz_results" className="font-normal cursor-pointer">Quiz results</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email_announcements" checked={prefs.email_announcements} onCheckedChange={handleToggle('email_announcements')} />
              <Label htmlFor="email_announcements" className="font-normal cursor-pointer">Course announcements</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email_deadline_reminders" checked={prefs.email_deadline_reminders} onCheckedChange={handleToggle('email_deadline_reminders')} />
              <Label htmlFor="email_deadline_reminders" className="font-normal cursor-pointer">Deadline reminders</Label>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
