import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HardDrive, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ImportProgressModal } from './ImportProgressModal'

interface DrivePickerButtonProps {
  onFileImported: (url: string, filename: string) => void
}

export function DrivePickerButton({ onFileImported }: DrivePickerButtonProps) {
  const [showProgress, setShowProgress] = useState(false)
  const [progressPct, setProgressPct] = useState(0)

  const importMutation = useMutation({
    mutationFn: async (fileId: string) => {
      setShowProgress(true)
      setProgressPct(10)

      const { data, error } = await supabase.functions.invoke('import-google-drive', {
        body: { file_id: fileId }
      })
      if (error) throw error

      setProgressPct(100)
      return data as { url: string; filename: string }
    },
    onSuccess: (data) => {
      onFileImported(data.url, data.filename)
      toast.success('File imported from Google Drive')
      setTimeout(() => setShowProgress(false), 1000)
    },
    onError: (err) => {
      toast.error(err.message)
      setShowProgress(false)
    }
  })

  const handlePick = () => {
    const connected = false
    if (!connected) {
      toast.success('Google Drive OAuth flow initiated (mock)')
      importMutation.mutate('mock_file_id')
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handlePick} disabled={importMutation.isPending}>
        {importMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <HardDrive className="w-4 h-4 mr-1" />
        )}
        Browse Google Drive
      </Button>
      <ImportProgressModal
        open={showProgress}
        progress={progressPct}
        filename=""
      />
    </>
  )
}
