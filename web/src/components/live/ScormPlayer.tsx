import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FileArchive } from 'lucide-react'

interface ScormPlayerProps {
  url: string
}

export function ScormPlayer({ url }: ScormPlayerProps) {
  const [loadError, setLoadError] = useState(false)

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <FileArchive className="w-12 h-12 mb-3" />
        <p className="text-sm">SCORM content is not available.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ height: '70vh' }}>
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 text-muted-foreground z-10">
          <p className="text-sm font-medium">Failed to load SCORM content</p>
          <p className="text-xs mt-1">
            The content may be unavailable or incompatible with your browser.
          </p>
        </div>
      )}
      <iframe
        src={url}
        className={cn('w-full h-full rounded-lg border', loadError && 'opacity-0')}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        allow="autoplay; encrypted-media"
        title="SCORM Content"
        onError={() => setLoadError(true)}
        onLoad={() => setLoadError(false)}
      />
    </div>
  )
}
