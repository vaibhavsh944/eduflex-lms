import type { ProfileExtended } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Globe, Link as LinkIcon, User, Hash, Mail, MapPin, Building } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileCardProps {
  profile: ProfileExtended;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const initials = profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/10 dark:to-background" />
      <CardContent className="relative px-6 pb-6 pt-0">
        <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 mb-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg bg-background">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
            <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <Badge variant={profile.role === 'instructor' ? 'default' : 'secondary'} className="capitalize">
                {profile.role}
              </Badge>
            </div>
            {profile.headline && <p className="text-lg text-muted-foreground">{profile.headline}</p>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.bio || "No bio provided yet."}
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              {profile.department_id && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{profile.department_id}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                  {profile.email}
                </a>
              </div>
              <div className="text-xs mt-4">
                Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Social Links</h3>
            <div className="flex flex-col gap-3">
              {profile.website ? (
                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Globe className="h-4 w-4" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              ) : null}
              
              {profile.github_username ? (
                <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <LinkIcon className="h-4 w-4" />
                  <span>{profile.github_username}</span>
                </a>
              ) : null}
              
              {profile.linkedin_url ? (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <User className="h-4 w-4" />
                  <span>LinkedIn Profile</span>
                </a>
              ) : null}
              
              {profile.twitter_handle ? (
                <a href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Hash className="h-4 w-4" />
                  <span>@{profile.twitter_handle.replace('@', '')}</span>
                </a>
              ) : null}

              {!profile.website && !profile.github_username && !profile.linkedin_url && !profile.twitter_handle && (
                <p className="text-sm text-muted-foreground">No social links added.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
