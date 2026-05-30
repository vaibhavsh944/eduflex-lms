import React, { useEffect } from 'react'
import { Menu, X, BookOpen } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Link, useParams } from 'react-router-dom'
import { useCoursePlayerStore } from '@/store/coursePlayerStore'
import { useThemeStore } from '@/store/themeStore'

interface PlayerTopBarProps {
  title: string
  progressPct: number
}

export function PlayerTopBar({ title, progressPct }: PlayerTopBarProps) {
  const { courseId } = useParams<{ courseId: string }>()
  const toggleSidebar = useCoursePlayerStore((s) => s.toggleSidebar)
  const { readingMode, setReadingMode } = useThemeStore()

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

  return (
    <div className="h-14 flex items-center justify-between px-4 bg-background border-b border-border z-10 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">E</span>
          </div>
          <span className="font-heading font-bold hidden sm:inline-block">EduFlow</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block mx-2" />
        <h1 className="text-sm font-medium truncate max-w-[200px] lg:max-w-[400px]">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant={readingMode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setReadingMode(!readingMode)}
          title="Reading Mode (Alt+R)"
        >
          <BookOpen className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline text-xs">{readingMode ? 'Exit Reading' : 'Reading'}</span>
        </Button>
        <div className="hidden md:flex items-center space-x-3 w-40">
          <span className="text-xs font-medium text-muted-foreground">{progressPct}%</span>
          <Progress value={progressPct} className="h-2 flex-1" />
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/catalog/${courseId}`}>
            <X className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
