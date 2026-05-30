import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { ArrowRight, BookOpen, Download, Loader2 } from 'lucide-react'
import type { EnrolledCourse } from '@/lib/types'

function CertificateButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const userId = useAuthStore(s => s.user?.id)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!userId) return
    const tab = window.open('', '_blank')
    setLoading(true)
    try {
      const { data: existing } = await supabase
        .from('certificates')
        .select('pdf_url')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()

      if (existing?.pdf_url) {
        if (tab) tab.location.href = existing.pdf_url
        return
      }

      const { data, error } = await supabase.functions.invoke('certs-generate', {
        body: { user_id: userId, course_id: courseId }
      })
      if (error) throw error
      if (data?.pdf_url) {
        if (tab) tab.location.href = data.pdf_url
      }
    } catch {
      toast.error('Could not generate certificate.')
      tab?.close()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs shrink-0" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Download className="w-3 h-3 mr-1" />
      )}
      Cert
    </Button>
  )
}

export function CourseProgressWidget({ enrollments }: { enrollments: EnrolledCourse[] }) {
  const displayCourses = enrollments.slice(0, 4)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
        <CardTitle className="flex items-center text-lg">
          <BookOpen className="w-5 h-5 mr-2 text-primary" />
          My Courses
        </CardTitle>
        <Link to="/student/courses" className="text-sm font-medium text-primary hover:underline flex items-center">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {displayCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">You haven't enrolled in any courses yet.</p>
            <Link to="/catalog" className="text-sm text-primary font-medium mt-2 inline-block hover:underline">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {displayCourses.map((e) => (
              <div key={e.enrollment_id} className="flex items-center p-4">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 mr-4">
                  {e.course.thumbnail_url ? (
                    <img src={e.course.thumbnail_url} alt={e.course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {e.course.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="text-sm font-medium truncate mb-2">{e.course.title}</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={e.progress_pct} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground w-8 text-right">{e.progress_pct}%</span>
                  </div>
                </div>
                {e.completed_at && (
                  <CertificateButton courseId={e.course.id} courseTitle={e.course.title} />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
