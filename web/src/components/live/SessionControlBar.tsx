import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Radio, Users, LogOut } from 'lucide-react'

interface SessionControlBarProps {
  isHost: boolean
  onEndSession?: () => void
  onLeaveSession?: () => void
  recording: boolean
  attendeeCount: number
}

export function SessionControlBar({ isHost, onEndSession, onLeaveSession, recording, attendeeCount }: SessionControlBarProps) {
  return (
    <div className="flex items-center justify-between border-t bg-background px-4 py-3">
      <div className="flex items-center gap-4">
        {isHost ? (
          <>
            <Button variant="destructive" size="sm" onClick={onEndSession}>
              <Radio className="mr-2 h-4 w-4" />
              End Session
            </Button>
            {recording && (
              <Badge variant="destructive" className="animate-pulse">
                <Mic className="mr-1 h-3 w-3" />
                REC
              </Badge>
            )}
            {!recording && (
              <Badge variant="secondary">
                <MicOff className="mr-1 h-3 w-3" />
                Not Recording
              </Badge>
            )}
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onLeaveSession}>
            <LogOut className="mr-2 h-4 w-4" />
            Leave Session
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{attendeeCount} attendee{attendeeCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}
