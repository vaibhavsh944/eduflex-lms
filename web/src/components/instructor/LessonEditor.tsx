import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlock from '@tiptap/extension-code-block';
import type { Lesson } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, FileText, Save, CheckCircle, Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, List, ListOrdered, Quote, Link, Image, Table as TableIcon, CheckSquare, Undo, Redo } from 'lucide-react';
import { VideoUploadZone } from '@/components/instructor/VideoUploadZone';
import { QuizBuilderDrawer } from '@/components/instructor/quiz/QuizBuilderDrawer';
import { useSaveQuiz } from '@/hooks/mutations/useSaveQuiz';
import { useQuiz } from '@/hooks/queries/useQuiz';
import { toast } from 'sonner';

interface LessonEditorProps {
  lesson: Lesson | null;
  onSave: (lesson: Lesson) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/20">
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-muted' : ''} title="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-muted' : ''} title="Italic">
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-muted' : ''} title="Underline">
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-muted' : ''} title="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </Button>
      <span className="w-px h-6 bg-border mx-1 self-center" />
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}>H1</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}>H2</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}>H3</Button>
      <span className="w-px h-6 bg-border mx-1 self-center" />
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-muted' : ''} title="Bullet List">
        <List className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-muted' : ''} title="Ordered List">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'bg-muted' : ''} title="Task List">
        <CheckSquare className="h-4 w-4" />
      </Button>
      <span className="w-px h-6 bg-border mx-1 self-center" />
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-muted' : ''} title="Quote">
        <Quote className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-muted' : ''} title="Code Block">
        <Code className="h-4 w-4" />
      </Button>
      <span className="w-px h-6 bg-border mx-1 self-center" />
      <Button type="button" variant="ghost" size="sm" onClick={addLink} className={editor.isActive('link') ? 'bg-muted' : ''} title="Link">
        <Link className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={addImage} title="Image">
        <Image className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table">
        <TableIcon className="h-4 w-4" />
      </Button>
      <span className="w-px h-6 bg-border mx-1 self-center" />
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo className="h-4 w-4" />
      </Button>
      {editor.storage.characterCount && (
        <span className="ml-auto text-xs text-muted-foreground self-center">
          {editor.storage.characterCount.characters()} characters
        </span>
      )}
    </div>
  );
};

export function LessonEditor({ lesson, onSave }: LessonEditorProps) {
  const [title, setTitle] = useState(lesson?.title || '');
  const [isFreePreview, setIsFreePreview] = useState(lesson?.is_free_preview || false);
  const [duration, setDuration] = useState(lesson?.duration_minutes?.toString() || '0');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [contentType, setContentType] = useState(lesson?.content_type === 'video' ? 'video' : lesson?.content_type === 'quiz' ? 'quiz' : 'text');
  const [youtubeUrl, setYoutubeUrl] = useState(lesson?.youtube_url || '');
  const [quizDrawerOpen, setQuizDrawerOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: existingQuiz } = useQuiz(lesson?.id);
  const saveQuiz = useSaveQuiz();

  useEffect(() => {
    setTitle(lesson?.title || '');
    setIsFreePreview(lesson?.is_free_preview || false);
    setDuration(lesson?.duration_minutes?.toString() || '0');
    setContentType(lesson?.content_type === 'video' ? 'video' : lesson?.content_type === 'quiz' ? 'quiz' : 'text');
    setYoutubeUrl(lesson?.youtube_url || '');
    setSaveStatus('saved');
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [lesson?.id]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      PlaceholderExtension.configure({ placeholder: 'Start writing your lesson content here...' }),
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlock,
    ],
    content: (lesson as any).content ?? lesson?.content_text ?? '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: () => { autoSave(); },
  }, [lesson?.id]);

  const doSave = useCallback(() => {
    if (!lesson) return;
    const updatedLesson = {
      ...lesson,
      title,
      type: contentType,
      content_type: contentType,
      video_url: lesson.video_url,
      youtube_url: youtubeUrl || null,
      is_free_preview: isFreePreview,
      duration_minutes: parseInt(duration, 10) || 0,
      content_text: editor?.getHTML() || (lesson as any).content || lesson.content_text,
    };
    setSaveStatus('saving');
    onSave(updatedLesson);
    setSaveStatus('saved');
  }, [lesson, title, contentType, isFreePreview, duration, editor, youtubeUrl, onSave]);

  const autoSave = useCallback(() => {
    setSaveStatus('unsaved');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(doSave, 2000);
  }, [doSave]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!lesson) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-12 text-center">
        <FileText className="h-12 w-12 mb-4 text-muted/50" />
        <h3 className="text-lg font-medium mb-1">No Lesson Selected</h3>
        <p className="text-sm">Select a lesson from the curriculum to edit its content.</p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Edit Lesson</CardTitle>
            <CardDescription>Update content and settings</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === 'saved' && <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Saved</span>}
            {saveStatus === 'saving' && <span className="text-xs text-amber-500 flex items-center gap-1"><Save className="h-3 w-3" /> Saving...</span>}
            {saveStatus === 'unsaved' && <span className="text-xs text-muted-foreground flex items-center gap-1">Unsaved changes</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-6">

        <div className="grid gap-6 p-4 border rounded-lg bg-muted/20">
          <div className="space-y-2">
            <Label>Lesson Title</Label>
            <Input value={title} onChange={(e) => { setTitle(e.target.value); autoSave(); }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Free Preview</Label>
              <p className="text-sm text-muted-foreground">Allow students to view this lesson without purchasing.</p>
            </div>
            <Switch checked={isFreePreview} onCheckedChange={(v) => { setIsFreePreview(v); autoSave(); }} />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input type="number" value={duration} onChange={(e) => { setDuration(e.target.value); autoSave(); }} className="w-32" />
          </div>
        </div>

        <div>
          <Label className="mb-4 block">Lesson Content</Label>
          <Tabs value={contentType} onValueChange={(v) => { setContentType(v); autoSave(); }} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="video"><Video className="h-4 w-4 mr-2" /> Video</TabsTrigger>
              <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2" /> Text/Article</TabsTrigger>
              <TabsTrigger value="quiz"><CheckCircle className="h-4 w-4 mr-2" /> Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="mt-0 space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <Label>Upload Video File</Label>
                <VideoUploadZone lessonId={lesson.id} onUploadComplete={(url) => {
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  setContentType('video');
                  const updatedLesson = { ...lesson, video_url: url, youtube_url: lesson.youtube_url, type: 'video' as const, content_type: 'video' as const };
                  onSave(updatedLesson);
                }} currentUrl={lesson.video_url} />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or use a URL</span>
                </div>
              </div>
              <div className="border rounded-lg p-4 space-y-3">
                <Label>YouTube / Vimeo Link</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    onBlur={() => {
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      if (youtubeUrl.trim()) doSave();
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Paste a YouTube or Vimeo video link. Supported formats: youtube.com/watch?v=, youtu.be/, vimeo.com/</p>
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-0">
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <MenuBar editor={editor} />
                <div className="flex-1 bg-background overflow-y-auto max-h-[500px]">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="mt-0">
              <div className="border rounded-lg p-6 bg-muted/10 text-center">
                <p className="text-muted-foreground mb-4">This lesson is configured as a quiz.</p>
                <Button variant="outline" onClick={() => setQuizDrawerOpen(true)}>Open Quiz Builder Drawer</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <QuizBuilderDrawer
          open={quizDrawerOpen}
          onOpenChange={setQuizDrawerOpen}
          onSave={(quiz) => {
            if (!lesson) return
            saveQuiz.mutate({
              lessonId: lesson.id,
              courseId: lesson.course_id,
              title: quiz.title,
              passing_score: quiz.passing_score,
              max_attempts: quiz.max_attempts,
              randomize_questions: quiz.randomize_questions,
              time_limit_minutes: quiz.time_limit_minutes,
              questions: quiz.questions,
            }, {
              onSuccess: () => toast.success('Quiz saved'),
              onError: (err) => toast.error(err.message),
            })
          }}
          existingQuestions={existingQuiz?.map((q: any) => ({
            id: q.id,
            type: q.type,
            body: q.question,
            points: q.points,
            explanation: q.explanation,
            options: q.quiz_options?.map((opt: any) => ({
              text: opt.option_text,
              is_correct: opt.is_correct,
            })) || (q.type === 'true_false'
              ? [{ text: 'True', is_correct: q.quiz_options?.[0]?.is_correct ?? true }, { text: 'False', is_correct: q.quiz_options?.[1]?.is_correct ?? false }]
              : undefined),
            correct_answer: q.type === 'true_false' ? (q.quiz_options?.[0]?.is_correct ?? true) : undefined,
            sample_answer: q.type === 'short_answer' ? q.quiz_options?.[0]?.option_text : undefined,
          }))}
        />

      </CardContent>
    </Card>
  );
}
