import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'

interface PDFViewerProps {
  url: string
  onViewed: () => void
}

export function PDFViewer({ url, onViewed }: PDFViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // PRD: "After 30 seconds of the iframe being visible... automatically mark the lesson as 'viewed'"
    // We'll use a simpler timeout since the component is mounted when visible
    const timer = setTimeout(() => {
      onViewed()
    }, 30000)
    return () => clearTimeout(timer)
  }, [onViewed])

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center px-6 pt-6">
        <Button variant="outline" asChild>
          <a href={url} download target="_blank" rel="noreferrer">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </a>
        </Button>
        <Button variant="ghost" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" /> Open in new tab
          </a>
        </Button>
      </div>
      
      <div className="flex-1 px-6 pb-6">
        <iframe
          ref={iframeRef}
          src={`${url}#toolbar=0`}
          className="w-full rounded-lg border border-border"
          style={{ height: 'calc(100vh - 200px)' }}
          title="PDF Document"
        />
      </div>
    </div>
  )
}
