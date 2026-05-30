import React from 'react'
import type { Assignment } from '@/lib/types'
import { format } from 'date-fns'
import { PenLine } from 'lucide-react'

export function AssignmentBrief({ assignment }: { assignment: Assignment }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-4 flex items-center">
          <PenLine className="w-8 h-8 mr-3 text-orange-500" />
          {assignment.title}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground border-b border-border pb-6">
          {assignment.due_at && (
            <span>Due: <strong className="text-foreground">{format(new Date(assignment.due_at), 'PPP')}</strong></span>
          )}
          <span>Type: <strong className="text-foreground capitalize">{assignment.submission_type}</strong></span>
          <span>Max attempts: <strong className="text-foreground">{assignment.max_attempts}</strong></span>
          <span>Passing score: <strong className="text-foreground">{assignment.passing_score}%</strong></span>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap">{assignment.description}</p>
      </div>

      {assignment.rubric && assignment.rubric.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Grading Rubric</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse border border-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 border border-border">Criterion</th>
                  <th className="px-4 py-3 border border-border w-24">Points</th>
                  <th className="px-4 py-3 border border-border">Description</th>
                </tr>
              </thead>
              <tbody>
                {assignment.rubric.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-4 py-3 border border-border font-medium">{r.criterion}</td>
                    <td className="px-4 py-3 border border-border text-center">{r.points}</td>
                    <td className="px-4 py-3 border border-border text-muted-foreground">{r.description}</td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-bold">
                  <td className="px-4 py-3 border border-border text-right">Total:</td>
                  <td className="px-4 py-3 border border-border text-center">
                    {assignment.rubric.reduce((acc, r) => acc + (r.points ?? 0), 0)} points
                  </td>
                  <td className="border border-border"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
