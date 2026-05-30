import { Button } from '@/components/ui/button'
import { Download, Eraser } from 'lucide-react'

interface WhiteboardPanelProps {
  isHost: boolean
}

export function WhiteboardPanel({ isHost }: WhiteboardPanelProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      {isHost && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eraser className="mr-2 h-4 w-4" />
            Clear Board
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      )}

      <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Whiteboard</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Interactive whiteboard requires{' '}
            <a
              href="https://tldraw.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-primary"
            >
              tldraw
            </a>{' '}
            to be configured.
          </p>
          <div className="mt-6 mx-auto h-64 w-full max-w-lg rounded-lg border bg-white/50 dark:bg-black/20" />
        </div>
      </div>

      {!isHost && (
        <p className="text-xs text-muted-foreground text-center">
          You are viewing the whiteboard in read-only mode.
        </p>
      )}
    </div>
  )
}
