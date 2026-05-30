import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useCoursePlayerStore } from '@/store/coursePlayerStore'
import { useStudentNotes, useSaveNote } from '@/hooks/queries/useStudentNotes'
import { Button } from '@/components/ui/button'
import { X, Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'

export function NotesPanel({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const open = useCoursePlayerStore((s) => s.notesPanelOpen)
  const toggle = useCoursePlayerStore((s) => s.toggleNotesPanel)
  
  const { data: note, isLoading } = useStudentNotes(lessonId)
  const { mutate: saveNote, isPending } = useSaveNote()
  
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    if (note?.updated_at) {
      setLastSaved(note.updated_at)
    }
  }, [note])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Jot down your notes here...' })
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[300px] max-w-none'
      }
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== note?.content) {
        saveNote({ lessonId, courseId, content: html }, {
          onSuccess: (data) => {
            if (data?.updated_at) setLastSaved(data.updated_at)
          }
        })
      }
    }
  }, [note?.id]) // Re-init if note id changes

  if (!open) return null

  return (
    <div className={cn(
      "absolute inset-y-0 right-0 w-80 bg-card border-l border-border flex flex-col shadow-2xl z-20",
      "transition-transform duration-300 transform translate-x-0"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h3 className="font-heading font-bold flex items-center">
          <span className="mr-2">📝</span> My Notes
        </h3>
        <Button variant="ghost" size="icon" onClick={toggle}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <EditorContent editor={editor} className="h-full" />
        )}
      </div>

      <div className="p-3 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center">
        {isPending ? (
          <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Saving...</>
        ) : lastSaved ? (
          <><Save className="w-3 h-3 mr-2" /> Saved {formatRelativeTime(lastSaved)}</>
        ) : (
          <><Save className="w-3 h-3 mr-2" /> All changes auto-save</>
        )}
      </div>
    </div>
  )
}
