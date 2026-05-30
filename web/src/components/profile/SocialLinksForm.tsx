import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ProfileExtended } from '@/lib/types';
import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Globe, Link as LinkIcon, User, Hash } from 'lucide-react';

const socialSchema = z.object({
  website: z.string().url('Must be a valid URL').nullable().or(z.literal('')),
  github_username: z.string().nullable().optional(),
  linkedin_url: z.string().url('Must be a valid URL').nullable().or(z.literal('')),
  twitter_handle: z.string().nullable().optional(),
});

type SocialFormValues = z.infer<typeof socialSchema>;

export function SocialLinksForm({ profile }: { profile: ProfileExtended }) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SocialFormValues>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      website: profile.website || '',
      github_username: profile.github_username || '',
      linkedin_url: profile.linkedin_url || '',
      twitter_handle: profile.twitter_handle || '',
    },
  });

  const onSubmit = (data: SocialFormValues) => {
    updateProfile({ 
      userId: profile.id, 
      data: {
        website: data.website || null,
        github_username: data.github_username || null,
        linkedin_url: data.linkedin_url || null,
        twitter_handle: data.twitter_handle || null,
      } 
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Add links to your social profiles and personal website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Personal Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="website" placeholder="https://yourwebsite.com" className="pl-10" {...register('website')} />
            </div>
            {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_username">GitHub Username</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="github_username" placeholder="username" className="pl-10" {...register('github_username')} />
            </div>
            {errors.github_username && <p className="text-sm text-destructive">{errors.github_username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="linkedin_url" placeholder="https://linkedin.com/in/username" className="pl-10" {...register('linkedin_url')} />
            </div>
            {errors.linkedin_url && <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_handle">Twitter/X Handle</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="twitter_handle" placeholder="@username" className="pl-10" {...register('twitter_handle')} />
            </div>
            {errors.twitter_handle && <p className="text-sm text-destructive">{errors.twitter_handle.message}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Links
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
