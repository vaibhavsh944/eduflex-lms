import React, { useCallback, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { EnrolledCourse } from '@/lib/types'

export function EnrolledCourseCard({ enrollment }: { enrollment: EnrolledCourse }) {
  const { course, progress_pct, last_lesson_id, completed_at } = enrollment
  const userId = useAuthStore(s => s.user?.id)
  const [loadingCert, setLoadingCert] = useState(false)

  const handleCertificate = useCallback(async () => {
    if (!userId) return
    const tab = window.open('', '_blank')
    setLoadingCert(true)
    try {
      const { data: existing } = await supabase
        .from('certificates')
        .select('pdf_url')
        .eq('user_id', userId)
        .eq('course_id', course.id)
        .maybeSingle()

      if (existing?.pdf_url) {
        if (tab) tab.location.href = existing.pdf_url
        return
      }

      const { data, error } = await supabase.functions.invoke('certs-generate', {
        body: { user_id: userId, course_id: course.id }
      })
      if (error) throw error
      if (data?.pdf_url) {
        if (tab) tab.location.href = data.pdf_url
      }
    } catch {
      toast.error('Could not generate certificate.')
      tab?.close()
    } finally {
      setLoadingCert(false)
    }
  }, [userId, course.id])

  return (
    <Card className="overflow-hidden flex flex-col h-full bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 group">
      <div className="h-40 bg-muted relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-4xl">
            {course.title.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="capitalize">{course.category.replace('-', ' ')}</Badge>
          <span className="text-xs text-muted-foreground capitalize">{course.level}</span>
        </div>
        
        <h3 className="text-lg font-bold font-heading leading-tight mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        {course.instructor && (
          <p className="text-sm text-muted-foreground mb-4">
            by {course.instructor.full_name}
          </p>
        )}
        
        <div className="mt-auto pt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-medium">{progress_pct}% complete</span>
              <span className="text-muted-foreground">
                {Math.round((progress_pct / 100) * course.lesson_count)} / {course.lesson_count} lessons
              </span>
            </div>
            <Progress value={progress_pct} className="h-2 transition-all duration-300 group-hover:bg-primary/20" />
          </div>
          
          <div className="flex gap-2">
            {completed_at ? (
              <>
                <Button className="flex-1" onClick={handleCertificate} disabled={loadingCert}>
                  {loadingCert ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {loadingCert ? 'Generating...' : 'Certificate'}
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/learn/${course.id}${last_lesson_id ? `/lesson/${last_lesson_id}` : ''}`}>
                    Review
                  </Link>
                </Button>
              </>
            ) : progress_pct === 0 ? (
              <Button className="w-full" asChild>
                <Link to={`/catalog/${course.id}`}>Start Course</Link>
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link to={`/learn/${course.id}${last_lesson_id ? `/lesson/${last_lesson_id}` : ''}`}>
                  Continue Learning →
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
