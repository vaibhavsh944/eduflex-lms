import { Link } from 'react-router-dom'
import { Play, FileText, CheckSquare, Lock, PenTool } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { ModuleWithLessons, Enrollment } from '@/lib/types'
import { formatDuration } from '@/lib/utils'

interface CurriculumAccordionProps {
  modules:          ModuleWithLessons[]
  enrollmentStatus: Enrollment | null
  courseId:         string
}

export function CurriculumAccordion({ modules, enrollmentStatus, courseId }: CurriculumAccordionProps) {
  if (!modules?.length) return null

  // By default, open the first module
  const defaultOpen = modules[0] ? [modules[0].id] : []

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
        {modules.map((module) => {
          const lessonCount = module.lessons?.length || 0
          const totalMinutes = (module.lessons || []).reduce((acc, l) => acc + (l.duration_minutes || 0), 0)

          return (
            <AccordionItem key={module.id} value={module.id} className="last:border-b-0">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 data-[state=open]:bg-muted/30">
                <div className="flex flex-col items-start gap-1 text-left">
                  <span className="font-semibold text-foreground">{module.title}</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'} · {formatDuration(totalMinutes)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-background pt-0 pb-0">
                <div className="divide-y divide-border">
                  {(module.lessons || []).map(lesson => {
                    const isEnrolled = enrollmentStatus !== null
                    const isPreview  = lesson.is_free_preview
                    const canAccess  = isEnrolled || isPreview

                    const getIcon = () => {
                      switch (lesson.type) {
                        case 'video': return <Play className="h-4 w-4" />
                        case 'pdf': case 'text': return <FileText className="h-4 w-4" />
                        case 'quiz': return <CheckSquare className="h-4 w-4" />
                        case 'assignment': return <PenTool className="h-4 w-4" />
                        default: return <FileText className="h-4 w-4" />
                      }
                    }

                    return (
                      <div key={lesson.id} className="flex items-center justify-between px-6 py-3 group hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex-shrink-0 ${canAccess ? 'text-primary' : 'text-muted-foreground'}`}>
                            {getIcon()}
                          </div>
                          <span className={`truncate text-sm ${!canAccess && 'text-muted-foreground'}`}>
                            {lesson.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                          {isPreview && !isEnrolled && (
                            <Link 
                              to={`/learn/${courseId}/lesson/${lesson.id}`}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Preview
                            </Link>
                          )}
                          {!canAccess ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {lesson.duration_minutes ? `${lesson.duration_minutes}m` : '—'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {!module.lessons?.length && (
                    <div className="px-6 py-4 text-sm text-muted-foreground italic">
                      No lessons in this module yet.
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}