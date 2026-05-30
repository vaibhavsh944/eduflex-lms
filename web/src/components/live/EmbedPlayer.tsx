import { useMemo } from 'react'
import { Link } from 'lucide-react'

interface EmbedPlayerProps {
  url: string
  type?: string
}

function detectEmbedType(url: string): string {
  if (!url) return 'unknown'
  if (url.includes('youtube.com/watch') || url.includes('youtu.be') || url.includes('youtube.com/embed')) {
    return 'youtube'
  }
  if (url.includes('loom.com') || url.includes('loom.com/share')) {
    return 'loom'
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo'
  }
  if (url.includes('docs.google.com')) {
    return 'google'
  }
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return 'video'
  }
  return 'embed'
}

function getEmbedUrl(url: string, type: string): string {
  if (type === 'youtube') {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    )
    if (match) return `https://www.youtube.com/embed/${match[1]}`
    if (url.includes('youtube.com/embed')) return url
    return url
  }
  if (type === 'loom') {
    const match = url.match(/loom\.com\/(?:share\/)?([a-zA-Z0-9]+)/)
    if (match) return `https://www.loom.com/embed/${match[1]}`
    return url
  }
  if (type === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/)
    if (match) return `https://player.vimeo.com/video/${match[1]}`
    return url
  }
  return url
}

export function EmbedPlayer({ url, type }: EmbedPlayerProps) {
  const detectedType = useMemo(() => type || detectEmbedType(url), [url, type])
  const embedUrl = useMemo(() => getEmbedUrl(url, detectedType), [url, detectedType])

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <Link className="w-12 h-12 mb-3" />
        <p className="text-sm">No embed URL provided.</p>
      </div>
    )
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-black"
      style={{ paddingTop: '56.25%' }}
    >
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        allow="autoplay; encrypted-media; fullscreen"
        title="Embedded Content"
        allowFullScreen
      />
    </div>
  )
}
