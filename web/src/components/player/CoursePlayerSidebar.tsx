import React, { useEffect, useRef } from 'react'
import type { CoursePlayerData } from '@/lib/types'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { LessonNavItem } from './LessonNavItem'
import { useCoursePlayerStore } from '@/store/coursePlayerStore'
import { useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface CoursePlayerSidebarProps {
  data: CoursePlayerData
}

export function CoursePlayerSidebar({ data }: CoursePlayerSidebarProps) {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const sidebarOpen = useCoursePlayerStore((s) => s.sidebarOpen)
  
  // Find which module contains the active lesson to keep it open
  const activeModuleId = data.modules.find(m => m.lessons.some(l => l.id === lessonId))?.id
  const [openItems, setOpenItems] = React.useState<string[]>(activeModuleId ? [activeModuleId] : [])

  useEffect(() => {
    if (activeModuleId && !openItems.includes(activeModuleId)) {
      setOpenItems(prev => [...prev, activeModuleId])
    }
  }, [activeModuleId, openItems])

  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll active item into view on mount or lesson change
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current) {
        const activeEl = scrollRef.current.querySelector('.border-primary')
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }, 100)
    return () => clearTimeout(timeout)
  }, [lessonId])

  if (!sidebarOpen) return null

  return (
    <div 
      className={cn(
        "flex flex-col w-80 bg-card/60 backdrop-blur-xl border-r border-border/50 h-full flex-shrink-0 transition-all duration-300",
        "absolute lg:relative z-20 shadow-2xl lg:shadow-none"
      )}
    >
      <div className="p-4 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <h2 className="font-heading font-bold text-lg leading-tight mb-2">Course Content</h2>
        <p className="text-sm font-medium text-muted-foreground">
          {data.completedLessons} / {data.totalLessons} lessons complete
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <Accordion 
          type="multiple" 
          value={openItems} 
          onValueChange={setOpenItems}
          className="w-full"
        >
          {data.modules.map((module, idx) => {
            const completedInModule = module.lessons.filter(l => l.progress?.completed).length
            return (
              <AccordionItem value={module.id} key={module.id} className="border-b border-border">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline data-[state=open]:bg-muted/30">
                  <div className="flex flex-col items-start text-left w-full pr-4">
                    <span className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                      Module {idx + 1}
                    </span>
                    <span className="text-sm font-bold">{module.title}</span>
                    <span className="text-xs text-muted-foreground mt-1 font-normal">
                      {completedInModule}/{module.lessons.length} complete
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-0">
                  <div className="flex flex-col py-2 space-y-1">
                    {module.lessons.map(lesson => (
                      <LessonNavItem 
                        key={lesson.id}
                        lesson={lesson}
                        courseId={courseId!}
                        isActive={lesson.id === lessonId}
                        // Only locked if it's not a free preview AND the user has no enrollment?
                        // If they are in the player, they must be enrolled, so nothing is locked
                        // unless we implement drip content. For Phase 3, we assume all are unlocked if enrolled.
                        isLocked={false} 
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}
