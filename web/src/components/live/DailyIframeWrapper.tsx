import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface DailyIframeWrapperProps {
  url?: string
  isOwner?: boolean
  userName?: string
}

export function DailyIframeWrapper({ url, isOwner, userName }: DailyIframeWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = ''
      }
    }
  }, [])

  if (!url) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center rounded-lg border bg-muted/30">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Waiting for session to start...</p>
        </div>
      </div>
    )
  }

  const iframeUrl = new URL(url)
  if (userName) {
    iframeUrl.searchParams.set('username', userName)
  }
  if (isOwner) {
    iframeUrl.searchParams.set('owner', 'true')
  }

  return (
    <div className="relative h-full min-h-[60vh] w-full overflow-hidden rounded-lg border">
      <iframe
        ref={iframeRef}
        src={iframeUrl.toString()}
        className="h-full w-full"
        allow="camera; microphone; fullscreen; speaker; display-capture"
        title="Live Session"
      />
    </div>
  )
}
