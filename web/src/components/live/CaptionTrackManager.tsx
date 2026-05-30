import { useEffect, useRef, useState } from 'react'
import { Subtitles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CaptionTrackManagerProps {
  videoRef: React.RefObject<HTMLVideoElement>
  captionsUrl: string
}

export function CaptionTrackManager({ videoRef, captionsUrl }: CaptionTrackManagerProps) {
  const [enabled, setEnabled] = useState(false)
  const trackRef = useRef<HTMLTrackElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !captionsUrl) return

    const existing = Array.from(video.children).find(
      (el) => el.tagName === 'TRACK'
    ) as HTMLTrackElement | undefined

    if (existing) {
      trackRef.current = existing
      return
    }

    const track = document.createElement('track')
    track.kind = 'subtitles'
    track.src = captionsUrl
    track.srclang = 'en'
    track.label = 'Auto-generated'
    track.default = false
    video.appendChild(track)
    trackRef.current = track

    return () => {
      if (track.parentNode === video) {
        video.removeChild(track)
      }
    }
  }, [videoRef, captionsUrl])

  const handleToggle = () => {
    const video = videoRef.current
    if (!video) return

    const track = trackRef.current
    if (!track) return

    const newState = !enabled
    setEnabled(newState)

    for (let i = 0; i < video.textTracks.length; i++) {
      const tt = video.textTracks[i]
      tt.mode = newState ? 'showing' : 'hidden'
    }
  }

  return (
    <Button
      variant={enabled ? 'default' : 'ghost'}
      size="sm"
      onClick={handleToggle}
      className="relative gap-1.5"
      title="Toggle captions"
    >
      <Subtitles className="h-4 w-4" />
      <span className="text-xs">CC</span>
      {enabled && captionsUrl && (
        <span className="text-[10px] text-muted-foreground">Auto-generated</span>
      )}
    </Button>
  )
}
