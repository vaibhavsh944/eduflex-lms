import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EnrolledCourse } from '@/lib/types'

interface ContinueLearningCardProps {
  enrollment: EnrolledCourse
}

export function ContinueLearningCard({ enrollment }: ContinueLearningCardProps) {
  const { course, progress_pct, last_lesson_id } = enrollment

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="flex flex-col sm:flex-row items-center p-6 gap-6 relative z-10">
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted shadow-sm group-hover:shadow-md transition-all duration-300">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {course.title.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1 w-full text-center sm:text-left space-y-1.5">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Pick up where you left off</p>
          <h3 className="text-xl font-heading font-bold truncate">{course.title}</h3>
          
          <div className="flex items-center space-x-4 mt-2">
            <Progress value={progress_pct} className="flex-1 h-2" />
            <span className="text-sm font-medium text-muted-foreground w-12 text-right">{progress_pct}%</span>
          </div>
        </div>

        <div className="w-full sm:w-auto flex-shrink-0">
          <Button asChild size="lg" className="w-full shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 rounded-full">
            <Link to={`/learn/${course.id}${last_lesson_id ? `/lesson/${last_lesson_id}` : ''}`}>
              Continue <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
