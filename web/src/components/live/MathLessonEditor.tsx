import { useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KaTeXRenderer } from './KaTeXRenderer'
import { cn } from '@/lib/utils'
import { Sigma, Plus, X } from 'lucide-react'

interface MathBlock {
  id: string
  latex: string
}

interface MathLessonEditorProps {
  value: {
    content: string
    mathBlocks: MathBlock[]
  }
  onChange: (value: { content: string; mathBlocks: MathBlock[] }) => void
}

export function MathLessonEditor({ value, onChange }: MathLessonEditorProps) {
  const [newLatex, setNewLatex] = useState('')

  const editor = useEditor({
    extensions: [StarterKit],
    content: value?.content || '',
    onUpdate: ({ editor: ed }) => {
      onChange({
        content: ed.getHTML(),
        mathBlocks: value?.mathBlocks || [],
      })
    },
  })

  const handleAddMathBlock = useCallback(() => {
    if (!newLatex.trim()) return
    const block: MathBlock = {
      id: crypto.randomUUID(),
      latex: newLatex.trim(),
    }
    onChange({
      content: editor?.getHTML() || '',
      mathBlocks: [...(value?.mathBlocks || []), block],
    })
    setNewLatex('')
  }, [newLatex, value, onChange, editor])

  const handleRemoveMathBlock = useCallback(
    (id: string) => {
      onChange({
        content: editor?.getHTML() || '',
        mathBlocks: (value?.mathBlocks || []).filter((b) => b.id !== id),
      })
    },
    [value, onChange, editor],
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-3">
          <label className="text-sm font-medium">Lesson Content (Text)</label>
          <div
            className={cn(
              'prose prose-slate dark:prose-invert max-w-none border rounded-lg p-3 min-h-[200px]',
              'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            )}
          >
            <EditorContent editor={editor} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Sigma className="w-4 h-4" />
            Math Blocks (KaTeX)
          </label>

          <div className="flex gap-2">
            <Input
              placeholder="Enter LaTeX, e.g. E = mc^2"
              value={newLatex}
              onChange={(e) => setNewLatex(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMathBlock()}
              className="font-mono text-sm"
            />
            <Button variant="outline" size="icon" onClick={handleAddMathBlock}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {newLatex.trim() && (
            <div className="p-3 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground mb-2">Live Preview:</p>
              <KaTeXRenderer latex={newLatex} displayMode />
            </div>
          )}

          <div className="space-y-2">
            {(value?.mathBlocks || []).map((block) => (
              <div
                key={block.id}
                className="flex items-start gap-2 p-3 rounded-lg bg-muted/20 border"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-mono mb-1 truncate">
                    {block.latex}
                  </div>
                  <KaTeXRenderer latex={block.latex} displayMode />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-destructive"
                  onClick={() => handleRemoveMathBlock(block.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {(value?.mathBlocks || []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No math blocks added yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
