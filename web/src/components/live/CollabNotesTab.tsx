import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Code, Maximize2, Minimize2 } from 'lucide-react'

interface Props {
  lessonId: string
}

export function CollabNotesTab({ lessonId }: Props) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: note } = useQuery({
    queryKey: ['collab-note', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collab_notes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!lessonId,
  })

  const [lastSavedBy, setLastSavedBy] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: note?.content ?? '<p>Add your notes here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      syncTimerRef.current = setTimeout(() => {
        syncNote(ed.getJSON())
      }, 1000)
    },
  })

  useEffect(() => {
    if (note && editor && !editor.isDestroyed) {
      const currentContent = JSON.stringify(editor.getJSON())
      const savedContent = JSON.stringify(note.content)
      if (currentContent !== savedContent) {
        editor.commands.setContent(note.content)
        toast.info('Notes updated by someone')
      }
      setLastSavedBy(note.last_updated_by)
    }
  }, [note, editor])

  const syncNote = useCallback(async (content: any) => {
    if (!lessonId || !user) return
    const { error } = await supabase
      .from('collab_notes')
      .upsert({
        lesson_id: lessonId,
        content,
        last_updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'lesson_id' })
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['collab-note', lessonId] })
    }
  }, [lessonId, user, queryClient])

  const ToolbarButton = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
    >
      {children}
    </button>
  )

  const toolbar = (
    <div className="flex items-center gap-1 p-2 border-b flex-wrap">
      <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')}>
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')}>
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <div className="ml-auto">
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setExpanded(true)}>
          <Maximize2 className="h-3 w-3" />
          Expand
        </Button>
      </div>
    </div>
  )

  const editorContent = <EditorContent editor={editor} />

  return (
    <>
      <div className="rounded-lg border">
        {toolbar}
        {editorContent}
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Collaborative Notes
              <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs gap-1" onClick={() => setExpanded(false)}>
                <Minimize2 className="h-3 w-3" />
                Minimize
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto rounded-lg border">
            {toolbar}
            <div className="min-h-[400px]">{editorContent}</div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
