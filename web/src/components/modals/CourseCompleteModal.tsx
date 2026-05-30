import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Download, Share2, CheckCircle2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { CoursePlayerData } from '@/lib/types'

interface CourseCompleteModalProps {
  isOpen: boolean
  onClose: () => void
  course: CoursePlayerData['course'] | null
}

export function CourseCompleteModal({ isOpen, onClose, course }: CourseCompleteModalProps) {
  const confettiFired = useRef(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && !confettiFired.current) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
      })
      confettiFired.current = true
    }
    
    if (!isOpen) {
      confettiFired.current = false
    }
  }, [isOpen])

  const handleDownload = useCallback(async () => {
    if (!user || !course) return
    const tab = window.open('', '_blank')
    setIsGenerating(true)
    try {
      const { data: existing } = await supabase
        .from('certificates')
        .select('pdf_url')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single()

      if (existing?.pdf_url) {
        setCertificateUrl(existing.pdf_url)
        if (tab) tab.location.href = existing.pdf_url
        setIsGenerating(false)
        return
      }

      const { data, error } = await supabase.functions.invoke('certs-generate', {
        body: { user_id: user.id, course_id: course.id }
      })
      if (error) throw error
      const url = data?.pdf_url
      if (url) {
        setCertificateUrl(url)
        if (tab) tab.location.href = url
      }
    } catch {
      toast.error('Could not generate certificate.')
      tab?.close()
    } finally {
      setIsGenerating(false)
    }
  }, [user, course])

  const shareUrl = certificateUrl
  const shareText = course ? `I just completed "${course.title}" on EduFlow! 🎉` : ''

  if (!course) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="flex flex-col items-center justify-center pt-8 pb-4">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-heading font-bold mb-2">Course Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You've successfully finished:
            <br />
            <strong className="text-foreground mt-1 block">{course.title}</strong>
          </p>

          <div className="w-full bg-muted/30 rounded-xl border border-border p-6 mb-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {certificateUrl ? (
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-2" />
            ) : (
              <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-2" />
            )}
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {certificateUrl ? 'Certificate Ready' : 'Certificate of Completion'}
            </p>
          </div>

          <div className="w-full space-y-3">
            <Button className="w-full" size="lg" onClick={handleDownload} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : certificateUrl ? 'View Certificate' : 'Download Certificate'}
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <a
                  href={shareUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { if (!shareUrl) e.preventDefault() }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> LinkedIn
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a
                  href={shareText ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}${shareUrl ? `&url=${encodeURIComponent(shareUrl)}` : ''}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { if (!shareText) e.preventDefault() }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Twitter
                </a>
              </Button>
            </div>
            
            <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/student/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
