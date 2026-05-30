import React, { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Play, Pause, StopCircle, Volume2 } from 'lucide-react'

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]

interface TextLessonProps {
  lesson: any
  onReadComplete: () => void
}

export function TextLesson({ lesson, onReadComplete }: TextLessonProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { speaking, paused, rate, speak, pause, resume, stop, setRate } = useTextToSpeech()

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onReadComplete()
          observer.disconnect()
        }
      },
      { threshold: 1.0 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [onReadComplete, lesson.id])

  const stripHtml = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const handleListen = () => {
    if (speaking && paused) {
      resume()
    } else if (speaking) {
      pause()
    } else {
      const text = lesson.title + '. ' + (lesson.content_text ? stripHtml(lesson.content_text) : '')
      speak(text, rate)
    }
  }

  const handleStop = () => {
    stop()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-heading font-bold">{lesson.title}</h1>
      </div>
      <div className="flex items-center text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
        <span>Reading time: ~{lesson.duration_minutes} min</span>
      </div>

      <div className="flex items-center gap-2 mb-6 p-2 bg-muted/30 rounded-lg border">
        <Button variant={speaking && !paused ? 'default' : 'outline'} size="sm" onClick={handleListen}>
          {speaking && !paused ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {speaking && !paused ? 'Pause' : speaking && paused ? 'Resume' : 'Listen'}
        </Button>
        {speaking && (
          <>
            <Button variant="outline" size="sm" onClick={handleStop}>
              <StopCircle className="w-4 h-4 mr-1" /> Stop
            </Button>
            <div className="flex items-center gap-1 ml-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <Select value={String(rate)} onValueChange={(v: string | null) => v && setRate(Number(v))}>
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_OPTIONS.map(s => (
                    <SelectItem key={s} value={String(s)}>{s}x</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <div ref={contentRef} className="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed">
        {lesson.content_text ? (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content_text) }} />
        ) : (
          <p className="text-muted-foreground">No content available for this lesson.</p>
        )}
      </div>

      <div ref={sentinelRef} className="h-10 mt-12" />
    </div>
  )
}
