import React from 'react'
import type { AssignmentSubmission } from '@/lib/types'
import { format } from 'date-fns'
import { Download, CheckCircle2, AlertCircle } from 'lucide-react'

export function SubmissionHistory({ submissions }: { submissions: AssignmentSubmission[] }) {
  if (submissions.length === 0) return null

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-xl font-bold mb-6">Previous Submissions</h3>
      <div className="space-y-4">
        {submissions.map((sub, idx) => (
          <div key={sub.id} className="p-5 border border-border bg-card rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold">Attempt {submissions.length - idx}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted {format(new Date(sub.submitted_at), 'PPP at p')}
                </p>
              </div>
              
              <div className="flex items-center text-sm font-medium">
                {sub.status === 'graded' ? (
                  <span className="flex items-center text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Score: {sub.score}%
                  </span>
                ) : (
                  <span className="flex items-center text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    Pending review
                  </span>
                )}
              </div>
            </div>

            {sub.file_url && sub.file_name && (
              <div className="mb-4">
                <a 
                  href={sub.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {sub.file_name} ({sub.file_size_bytes ? (sub.file_size_bytes / 1024 / 1024).toFixed(2) : '0'} MB)
                </a>
              </div>
            )}

            {sub.text_content && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm max-h-40 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: sub.text_content }} className="prose prose-sm dark:prose-invert" />
              </div>
            )}

            {sub.feedback && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                <p className="font-semibold text-primary mb-1">Instructor Feedback:</p>
                <p className="text-muted-foreground">{sub.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
