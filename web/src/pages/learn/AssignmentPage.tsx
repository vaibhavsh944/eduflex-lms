import React, { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useCoursePlayer } from '@/hooks/queries/useCoursePlayer'
import { useAssignment, useSubmissionHistory, useSubmitAssignment } from '@/hooks/queries/useAssignment'
import { AssignmentBrief } from '@/components/assignment/AssignmentBrief'
import { FileUploadZone } from '@/components/assignment/FileUploadZone'
import { SubmissionHistory } from '@/components/assignment/SubmissionHistory'
import { SkeletonPage } from '@/components/common/SkeletonPage'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Loader2 } from 'lucide-react'

export default function AssignmentPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  
  const { data: courseData, isLoading: courseLoading } = useCoursePlayer(courseId)
  const { data: assignment, isLoading: assignmentLoading } = useAssignment(lessonId)
  const { data: submissions, isLoading: submissionsLoading } = useSubmissionHistory(assignment?.id)
  const { mutate: submitAssignment, isPending } = useSubmitAssignment()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0) // Mocking progress for now

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your response here...' }),
      CharacterCount
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[200px] max-w-none p-4'
      }
    }
  })

  if (courseLoading || assignmentLoading || submissionsLoading) return <SkeletonPage />
  if (!courseData || !assignment) return <ErrorState title="Assignment unavailable" />

  const lesson = courseData.modules.flatMap(m => m.lessons).find(l => l.id === lessonId)
  if (!lesson) return <Navigate to={`/catalog/${courseId}`} replace />

  const handleSubmit = () => {
    setErrorMsg(null)
    const textContent = editor?.getHTML()
    const isTextEmpty = editor?.isEmpty
    
    const requiresText = assignment.submission_type === 'text' || assignment.submission_type === 'both'
    const requiresFile = assignment.submission_type === 'file' || assignment.submission_type === 'both'

    if (requiresText && isTextEmpty && !requiresFile) {
      setErrorMsg("Please provide a text response.")
      return
    }

    if (requiresFile && !selectedFile && !requiresText) {
      setErrorMsg("Please upload a file.")
      return
    }

    if (requiresText && requiresFile && isTextEmpty && !selectedFile) {
      setErrorMsg("Please provide either a text response or upload a file.")
      return
    }

    // Mock progress interval
    setUploadProgress(10)
    const interval = setInterval(() => {
      setUploadProgress(p => Math.min(p + 20, 90))
    }, 500)

    submitAssignment({
      assignmentId: assignment.id,
      courseId: courseId!,
      textContent: isTextEmpty ? undefined : textContent,
      file: selectedFile || undefined
    }, {
      onSuccess: () => {
        clearInterval(interval)
        setUploadProgress(100)
        setTimeout(() => setUploadProgress(0), 1000)
        setSelectedFile(null)
        editor?.commands.setContent('')
      },
      onError: () => {
        clearInterval(interval)
        setUploadProgress(0)
      }
    })
  }

  // PRD: check max attempts
  const attemptsUsed = submissions?.length || 0
  const canSubmit = attemptsUsed < assignment.max_attempts

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <AssignmentBrief assignment={assignment} />

      <div className="mt-12 bg-muted/10 border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Your Submission</h3>
        
        {!canSubmit ? (
          <div className="p-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg">
            You have reached the maximum number of attempts ({assignment.max_attempts}) for this assignment.
          </div>
        ) : (
          <div className="space-y-6">
            {(assignment.submission_type === 'text' || assignment.submission_type === 'both') && (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <EditorContent editor={editor} />
                <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground text-right">
                  {editor?.storage.characterCount.characters()} characters
                </div>
              </div>
            )}

            {(assignment.submission_type === 'file' || assignment.submission_type === 'both') && (
              <FileUploadZone
                accept={assignment.allowed_types || ['.pdf', '.docx', '.zip']}
                maxMb={assignment.max_file_mb || 50}
                onFileSelect={(f) => { setSelectedFile(f); setErrorMsg(null) }}
                onError={(msg) => setErrorMsg(msg)}
                selectedFile={selectedFile}
              />
            )}

            {errorMsg && (
              <div className="text-sm font-medium text-red-500 mt-2">
                {errorMsg}
              </div>
            )}

            {isPending && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button size="lg" onClick={handleSubmit} disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Assignment
              </Button>
            </div>
          </div>
        )}
      </div>

      <SubmissionHistory submissions={submissions || []} />
    </div>
  )
}
