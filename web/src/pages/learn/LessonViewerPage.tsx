import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCoursePlayer } from '@/hooks/queries/useCoursePlayer'
import { VideoPlayer } from '@/components/player/VideoPlayer'
import { PDFViewer } from '@/components/player/PDFViewer'
import { NotesPanel } from '@/components/player/NotesPanel'
import { ReadingModeOverlay } from '@/components/common/ReadingModeOverlay'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useSaveVideoPosition } from '@/hooks/mutations/useSaveVideoPosition'
import { useMarkLessonComplete } from '@/hooks/mutations/useMarkLessonComplete'
import { useLessonProgressRealtime } from '@/hooks/realtime/useLessonProgressRealtime'
import { useCoursePlayerStore } from '@/store/coursePlayerStore'
import { useThemeStore } from '@/store/themeStore'
import { useLessonQA } from '@/hooks/queries/useForum'
import { QAQuestionItem } from '@/components/forum/QAQuestionItem'
import { AskQuestionModal } from '@/components/forum/AskQuestionModal'
import { Button } from '@/components/ui/button'
import { Edit3, BookOpen, Volume2, MessageSquare, HelpCircle, Bot } from 'lucide-react'
import { cn, sanitizeHtml } from '@/lib/utils'

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : url;
}
import { supabase } from '@/lib/supabase'
import { AiTutorDrawer } from '@/components/ai/AiTutorDrawer'
import { AiRateLimitBanner } from '@/components/ai/AiRateLimitBanner'
import { useAiStore } from '@/store/aiStore'
import { InlineQuizSection } from '@/components/quiz/InlineQuizSection'

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { data } = useCoursePlayer(courseId)
  const { savePosition } = useSaveVideoPosition(lessonId, courseId)
  const { mutate: markComplete } = useMarkLessonComplete()
  useLessonProgressRealtime()
  const toggleNotes = useCoursePlayerStore((s) => s.toggleNotesPanel)
  const readingMode = useThemeStore((s) => s.readingMode)
  const setReadingMode = useThemeStore((s) => s.setReadingMode)
  const tts = useTextToSpeech()
  const [readCompleted, setReadCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'qa'>('content')
  const [showAskModal, setShowAskModal] = useState(false)
  const { data: qaQuestions } = useLessonQA(lessonId || '')
  const { openTutor, tutorOpen } = useAiStore()
  const completingRef = useRef(false)

  const { data: aiUsage } = useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      try {
        const { data: usage, error } = await supabase
          .from('ai_usage_log')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 86400000).toISOString());
        if (error) throw error;
        return { count: usage?.length ?? 0, limit: 20 };
      } catch {
        return { count: 0, limit: 20 };
      }
    },
    staleTime: 60000,
  })

  useEffect(() => {
    if (!lessonId) return;
    // AI conversation persistence — table may not be available yet
  }, [lessonId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'r') {
        e.preventDefault()
        setReadingMode(!readingMode)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [readingMode, setReadingMode])

  if (!data) return null

  const lesson = data.modules.flatMap(m => m.lessons).find(l => l.id === lessonId)
  if (!lesson) return <Navigate to={`/catalog/${courseId}`} replace />

  if (!lesson.is_free_preview && !data.isEnrolled) {
     return <Navigate to={`/catalog/${courseId}`} replace />
  }

  const handleReadComplete = () => {
    setReadCompleted(true)
  }

  const handleVideoEnded = useCallback(() => {
    setReadCompleted(true)
    if (lessonId && courseId && !lesson?.progress?.completed && !completingRef.current) {
      completingRef.current = true
      markComplete({ lessonId, courseId })
    }
  }, [lessonId, courseId, lesson?.progress?.completed, markComplete])

  const handleVideoProgress = useCallback((seconds: number) => {
    savePosition(seconds)
    const durationMins = lesson?.duration_minutes || 0
    if (durationMins > 0 && lessonId && courseId && !lesson?.progress?.completed && !completingRef.current) {
      const pct = (seconds / (durationMins * 60)) * 100
      if (pct >= 90) {
        completingRef.current = true
        markComplete({ lessonId, courseId })
      }
    }
  }, [savePosition, lesson?.duration_minutes, lesson?.progress?.completed, lessonId, courseId, markComplete])

  const textContent = lesson.content_text || ''

  return (
    <div className="flex flex-1 h-full w-full relative">
      {readingMode && lesson.type === 'text' && (
        <ReadingModeOverlay
          title={lesson.title}
          content={textContent}
          onClose={() => setReadingMode(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto w-full relative">
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-8">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab('content')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'content'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <BookOpen className="h-4 w-4 inline mr-1.5" />
                Content
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'qa'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <MessageSquare className="h-4 w-4 inline mr-1.5" />
                Q&A
                {qaQuestions && qaQuestions.length > 0 && (
                  <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{qaQuestions.length}</span>
                )}
              </button>
            </div>
            <div className="flex gap-2">
              {activeTab === 'content' && (
                <>
                  {lesson.type !== 'pdf' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setReadingMode(true)} aria-label="Open reading mode">
                        <BookOpen className="w-4 h-4 mr-1.5" /> Reading Mode
                      </Button>
                      <Button variant="outline" size="sm" onClick={toggleNotes}>
                        <Edit3 className="w-4 h-4 mr-1.5" /> Notes
                      </Button>
                    </>
                  )}
                </>
              )}
              {activeTab === 'qa' && (
                <Button size="sm" onClick={() => setShowAskModal(true)}>
                  <HelpCircle className="h-4 w-4 mr-1.5" />
                  Ask a Question
                </Button>
              )}
              {lessonId && (
                <Button variant="outline" size="sm" onClick={() => openTutor(lessonId)}>
                  <Bot className="h-4 w-4 mr-1.5" />
                  AI Tutor
                </Button>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'content' ? (
          <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
            {lesson.content_url && (
              <VideoPlayer
                url={lesson.content_url}
                initialSeconds={lesson.progress?.last_position ?? 0}
                onProgress={handleVideoProgress}
                onEnded={handleVideoEnded}
              />
            )}

            {lesson.youtube_url && (
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(lesson.youtube_url)}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {(lesson.content_text || lesson.content_url || lesson.youtube_url) && (
              <div>
                <h1 className="text-2xl font-heading font-bold mb-4">{lesson.title}</h1>
                {lesson.content_text && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (tts.speaking && tts.paused) {
                            tts.resume()
                          } else if (tts.speaking) {
                            tts.pause()
                          } else {
                            const stripHtml = textContent.replace(/<[^>]*>/g, '')
                            tts.speak(stripHtml, tts.rate)
                          }
                        }}
                      >
                        {tts.speaking && !tts.paused ? 'Pause' : tts.speaking && tts.paused ? 'Resume' : 'Listen'}
                      </Button>
                      {tts.speaking && (
                        <Button variant="ghost" size="sm" onClick={() => tts.stop()}>Stop</Button>
                      )}
                    </div>
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content_text) }}
                    />
                  </>
                )}
              </div>
            )}

            {lesson.type === 'assignment' && (
              <Navigate to={`/learn/${courseId}/assignment/${lessonId}`} replace />
            )}

            {lesson.type === 'pdf' && lesson.content_url && (
              <PDFViewer url={lesson.content_url} onViewed={handleReadComplete} />
            )}

            <InlineQuizSection lessonId={lessonId!} courseId={courseId!} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-4 sm:p-8">
            <div className="space-y-3">
              {!qaQuestions?.length ? (
                <div className="text-center py-16 border rounded-xl bg-card">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold">No questions yet</h3>
                  <p className="text-muted-foreground mt-2">Be the first to ask a question about this lesson!</p>
                  <Button className="mt-4" onClick={() => setShowAskModal(true)}>Ask a Question</Button>
                </div>
              ) : (
                qaQuestions.map(q => (
                  <QAQuestionItem key={q.id} question={q} lessonId={lessonId!} courseId={courseId!} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <NotesPanel lessonId={lessonId!} courseId={courseId!} />

      {lessonId && aiUsage && (
        <div className="fixed bottom-4 left-4 z-40 max-w-sm">
          <AiRateLimitBanner
            remaining={aiUsage.limit - aiUsage.count}
            limit={aiUsage.limit}
            resetsAt={new Date(Date.now() + 86400000).toISOString()}
            onDismiss={undefined}
          />
        </div>
      )}

      {lessonId && tutorOpen && (
        <AiTutorDrawer lessonId={lessonId} courseId={courseId!} />
      )}

      {lessonId && (
        <AskQuestionModal
          open={showAskModal}
          onOpenChange={setShowAskModal}
          lessonId={lessonId}
        />
      )}
    </div>
  )
}
