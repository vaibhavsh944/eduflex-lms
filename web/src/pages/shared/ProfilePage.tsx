import { useParams, Link } from 'react-router-dom';
import { useProfile, useCurrentProfile } from '@/hooks/useProfile';
import { PageHeader } from '@/components/common/PageHeader';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { Button } from '@/components/ui/button';
import { SkeletonPage } from '@/components/common/SkeletonPage';
import { ErrorState } from '@/components/common/ErrorState';
import { SEO } from '@/components/shared/SEO';
import { Edit, Settings, CreditCard } from 'lucide-react';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: currentProfile, isLoading: isCurrentLoading } = useCurrentProfile();
  
  // If we have a userId in the URL, fetch that profile. Otherwise use the current auth user.
  const isSelf = !userId || currentProfile?.id === userId;
  const idToFetch = userId || currentProfile?.id;

  const { data: profile, isLoading, error } = useProfile(idToFetch);

  if (isLoading || isCurrentLoading) return <SkeletonPage />;
  if (error || !profile) return <ErrorState title="Profile not found" message="This profile doesn't exist or you don't have access." />;

  return (
    <>
      <SEO title="Profile | EduFlow" />
      <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <PageHeader 
            title="Profile" 
            description={isSelf ? "Your public profile view." : `Viewing ${profile.full_name}'s profile.`} 
          />
        </div>
        {isSelf && (
          <Link to="/profile/edit">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-6">
        <ProfileCard profile={profile} />
        
        {isSelf && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link to="/profile/payments">
              <Button variant="ghost" className="gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Payment History
              </Button>
            </Link>
            <Link to="/profile/edit">
              <Button variant="ghost" className="gap-2 text-muted-foreground">
                <Settings className="h-4 w-4" />
                Account Settings
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
