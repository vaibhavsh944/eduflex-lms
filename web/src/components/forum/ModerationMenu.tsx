import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pin, Lock, AlertTriangle, Trash2 } from 'lucide-react'

interface ModerationMenuProps {
  onPin?: () => void
  onLock?: () => void
  onMarkOffTopic?: () => void
  onDelete?: () => void
  isPinned?: boolean
  isLocked?: boolean
}

export function ModerationMenu({ onPin, onLock, onMarkOffTopic, onDelete, isPinned, isLocked }: ModerationMenuProps) {
  const [open, setOpen] = useState(false)

  const hasActions = onPin || onLock || onMarkOffTopic || onDelete
  if (!hasActions) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onPin && (
          <DropdownMenuItem onClick={() => { onPin(); setOpen(false) }}>
            <Pin className="mr-2 h-4 w-4" />
            {isPinned ? 'Unpin' : 'Pin Thread'}
          </DropdownMenuItem>
        )}
        {onLock && (
          <DropdownMenuItem onClick={() => { onLock(); setOpen(false) }}>
            <Lock className="mr-2 h-4 w-4" />
            {isLocked ? 'Unlock' : 'Lock Thread'}
          </DropdownMenuItem>
        )}
        {onMarkOffTopic && (
          <DropdownMenuItem onClick={() => { onMarkOffTopic(); setOpen(false) }}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Mark Off-Topic
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            {(onPin || onLock || onMarkOffTopic) && <DropdownMenuSeparator />}
            <DropdownMenuItem className="text-red-600" onClick={() => { onDelete(); setOpen(false) }}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
