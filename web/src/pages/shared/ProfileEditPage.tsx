import { useCurrentProfile } from '@/hooks/useProfile';
import { PageHeader } from '@/components/common/PageHeader';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { SocialLinksForm } from '@/components/profile/SocialLinksForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { NotificationPreferencesForm } from '@/components/profile/NotificationPreferencesForm';
import { AccessibilitySettingsForm } from '@/components/profile/AccessibilitySettingsForm';
import { SkeletonPage } from '@/components/common/SkeletonPage';

export function ProfileEditPage() {
  const { data: profile, isLoading } = useCurrentProfile();

  if (isLoading || !profile) return <SkeletonPage />;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader 
        title="Edit Profile" 
        description="Manage your account settings and preferences." 
      />

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <div className="space-y-8">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <AvatarUploader 
              userId={profile.id} 
              currentAvatarUrl={profile.avatar_url} 
              fullName={profile.full_name} 
            />
          </div>
          
          <PasswordChangeForm />
        </div>

        <div className="space-y-8">
          <ProfileForm profile={profile} />
          <SocialLinksForm profile={profile} />
          <NotificationPreferencesForm profile={profile} />
          <AccessibilitySettingsForm />
        </div>
      </div>
    </div>
  );
}
