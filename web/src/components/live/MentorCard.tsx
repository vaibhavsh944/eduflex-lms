import type { Profile } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface Props {
  mentor: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  sharedCourses?: string[]
  status?: string
}

export function MentorCard({ mentor, sharedCourses, status }: Props) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mentor.avatar_url ?? undefined} />
            <AvatarFallback>{getInitials(mentor.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{mentor.full_name}</p>
            {sharedCourses && sharedCourses.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {sharedCourses.slice(0, 3).map((course) => (
                  <Badge key={course} variant="secondary" className="text-xs font-normal">
                    {course}
                  </Badge>
                ))}
                {sharedCourses.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{sharedCourses.length - 3} more</span>
                )}
              </div>
            )}
          </div>
          {status && (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
