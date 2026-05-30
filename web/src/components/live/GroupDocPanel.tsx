import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Code, Heading1, Heading2,
} from 'lucide-react'

interface Props {
  groupId: string
}

export function GroupDocPanel({ groupId }: Props) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: doc, isLoading } = useQuery({
    queryKey: ['group-doc', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_group_doc')
        .select('*')
        .eq('group_id', groupId)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!groupId,
  })

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: doc?.content ?? '<p>Start collaborating...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      syncTimerRef.current = setTimeout(() => {
        syncDoc(ed.getJSON())
      }, 500)
    },
  })

  useEffect(() => {
    if (doc && editor && !editor.isDestroyed) {
      const currentContent = JSON.stringify(editor.getJSON())
      const savedContent = JSON.stringify(doc.content)
      if (currentContent !== savedContent) {
        editor.commands.setContent(doc.content)
      }
      setLastUpdatedBy(doc.updated_by)
      setLastUpdatedAt(doc.updated_at)
    }
  }, [doc, editor])

  const syncDoc = useCallback(async (content: any) => {
    if (!groupId || !user) return
    const { error } = await supabase
      .from('study_group_doc')
      .upsert({
        group_id: groupId,
        content,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'group_id' })
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['group-doc', groupId] })
    }
  }, [groupId, user, queryClient])

  const handleDownloadMD = () => {
    if (!editor) return
    const md = (editor.storage as any).markdown?.getMarkdown?.() ?? editor.getText()
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `group-notes-${groupId}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.info('Download started')
  }

  const ToolbarButton = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
    >
      {children}
    </button>
  )

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-2 flex items-center gap-1 flex-wrap">
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })}>
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <span className="w-px h-5 bg-border mx-1" />
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
          <Button variant="outline" size="sm" onClick={handleDownloadMD} className="text-xs">
            Download as MD
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {lastUpdatedBy && lastUpdatedAt && (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Last edited by {lastUpdatedBy === user?.id ? 'you' : 'someone'} at {format(new Date(lastUpdatedAt), 'h:mm a')}
        </div>
      )}
    </div>
  )
}
