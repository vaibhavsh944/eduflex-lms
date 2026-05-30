import { cn, getInitials } from '@/lib/utils'

interface UserAvatarProps {
  fullName: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function UserAvatar({ fullName, avatarUrl, size = 'md', className }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className={cn('rounded-full object-cover shrink-0', sizeMap[size], className)}
      />
    )
  }
  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0',
        sizeMap[size],
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(fullName)}
    </div>
  )
}
