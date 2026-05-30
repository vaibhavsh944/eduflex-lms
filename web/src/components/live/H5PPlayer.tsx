import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Puzzle } from 'lucide-react'

interface H5PPlayerProps {
  url: string
}

export function H5PPlayer({ url }: H5PPlayerProps) {
  const [loadError, setLoadError] = useState(false)

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <Puzzle className="w-12 h-12 mb-3" />
        <p className="text-sm">H5P content is not available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full" style={{ height: '65vh' }}>
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 text-muted-foreground z-10">
            <p className="text-sm font-medium">Failed to load H5P content</p>
          </div>
        )}
        <iframe
          src={url}
          className={cn('w-full h-full rounded-lg border', loadError && 'opacity-0')}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="autoplay; encrypted-media"
          title="H5P Content"
          onError={() => setLoadError(true)}
          onLoad={() => setLoadError(false)}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Completion tracking is not available for H5P content.
      </p>
    </div>
  )
}
