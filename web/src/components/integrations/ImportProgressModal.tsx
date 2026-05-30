import React from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { HardDrive, CheckCircle2 } from 'lucide-react'

interface ImportProgressModalProps {
  open: boolean
  progress: number
  filename: string
}

export function ImportProgressModal({ open, progress, filename }: ImportProgressModalProps) {
  const isComplete = progress >= 100

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <HardDrive className="w-5 h-5 text-blue-600 animate-pulse" />
            )}
            {isComplete ? 'Import Complete' : 'Importing from Google Drive'}
          </DialogTitle>
          <DialogDescription>
            {filename || 'Preparing file transfer...'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
        </div>
        {isComplete && (
          <p className="text-sm text-green-600 font-medium text-center">File ready to use</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
