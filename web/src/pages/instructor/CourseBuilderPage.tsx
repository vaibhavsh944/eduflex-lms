import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCourseCurriculum, useReorderCurriculum, useUpdateCourse, useUpdateLesson, usePublishCourse, useCreateModule, useCreateLesson, useDeleteModule, useDeleteLesson, useDeleteCourse } from '@/hooks/queries/useInstructor';
import { ROUTES } from '@/lib/constants';
import { PageHeader } from '@/components/common/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CurriculumBuilder } from '@/components/instructor/CurriculumBuilder';
import { LessonEditor } from '@/components/instructor/LessonEditor';
import { QuizGeneratorPanel } from '@/components/ai/QuizGeneratorPanel';
import { ImageUploadZone } from '@/components/ui/ImageUploadZone';
import type { Course, Module, Lesson } from '@/lib/types';
import { normalizeVideoUrl } from '@/lib/utils';
import { ArrowLeft, BookOpen, Settings, Eye, Trash2, ExternalLink, Save } from 'lucide-react';
import { toast } from 'sonner';

export function CourseBuilderPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'curriculum';
  
  const { data: curriculum, isLoading } = useCourseCurriculum(courseId);
  const { mutate: reorderCurriculum } = useReorderCurriculum();
  const { mutate: updateCourse } = useUpdateCourse();
  const { mutate: publishCourse, isPending: isPublishing } = usePublishCourse();
  const { mutate: updateLesson } = useUpdateLesson();
  const { mutate: createModule } = useCreateModule();
  const { mutate: createLesson } = useCreateLesson();
  const { mutate: deleteModule } = useDeleteModule();
  const { mutate: deleteLesson } = useDeleteLesson();
  const { mutate: deleteCourse } = useDeleteCourse();

  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>();

  // Synchronize with query data
  useEffect(() => {
    if (curriculum) {
      setModules(curriculum.modules);
      setLessons(curriculum.lessons);
      // Auto-select first lesson if none selected
      if (!selectedLessonId && curriculum.lessons.length > 0) {
        setSelectedLessonId(curriculum.lessons[0].id);
      }
    }
  }, [curriculum, selectedLessonId]);

  const handleReorder = (newModules: Module[], newLessons: Lesson[]) => {
    setModules(newModules);
    setLessons(newLessons);
    reorderCurriculum({ modules: newModules, lessons: newLessons });
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
  };

  const handleAddModule = () => {
    if (!courseId) return;
    createModule({ courseId });
  };

  const handleAddLesson = (moduleId: string) => {
    if (!courseId || !moduleId) return;
    createLesson({ moduleId, courseId });
  };

  const handleDeleteModule = (moduleId: string) => {
    deleteModule(moduleId);
  };

  const handleDeleteLesson = (lessonId: string) => {
    deleteLesson(lessonId);
  };

    const handleSaveLesson = (updatedLesson: Lesson) => {
    setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l));
    updateLesson({
      lessonId: updatedLesson.id,
      courseId: courseId!,
      title: updatedLesson.title,
      content: updatedLesson.content_text || null,
      content_type: updatedLesson.content_type || 'text',
      video_url: updatedLesson.video_url || null,
      youtube_url: normalizeVideoUrl(updatedLesson.youtube_url) || null,
      duration_mins: updatedLesson.duration_minutes || updatedLesson.duration || 0,
      is_free_preview: updatedLesson.is_free_preview,
    });
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId) || null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading Builder..." description="" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Course Builder</h1>
            <p className="text-muted-foreground text-sm">Manage curriculum and content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/catalog/${courseId}`, '_blank')}>Preview Course</Button>
          <Button disabled={isPublishing} onClick={() => {
            if (lessons.length === 0) {
              toast.error('Cannot publish: add at least one lesson first.');
              return;
            }
            publishCourse({ courseId: courseId!, lessonsCount: lessons.length });
          }}>
            {isPublishing ? 'Publishing...' : 'Publish Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start border-b rounded-none pb-0 h-auto bg-transparent mb-4">
          <TabsTrigger value="curriculum" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">
            <BookOpen className="h-4 w-4 mr-2" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="flex-1 m-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
            {/* Left Panel: Drag and Drop Curriculum */}
            <Card className="md:col-span-4 lg:col-span-3 overflow-y-auto">
              <CardContent className="p-4">
                <CurriculumBuilder 
                  modules={modules} 
                  lessons={lessons} 
                  onReorder={handleReorder}
                  onSelectLesson={handleSelectLesson}
                  onAddLesson={handleAddLesson}
                  onAddModule={handleAddModule}
                  onDeleteModule={handleDeleteModule}
                  onDeleteLesson={handleDeleteLesson}
                  selectedLessonId={selectedLessonId}
                />
              </CardContent>
            </Card>

            {/* Right Panel: TipTap / Lesson Editor */}
            <div className="md:col-span-8 lg:col-span-9 overflow-y-auto pr-2 space-y-4">
              {lessons.length > 0 ? (
                <>
                  <LessonEditor lesson={selectedLesson} onSave={handleSaveLesson} />
                  {selectedLesson?.type === 'quiz' && selectedLesson && (
                    <QuizGeneratorPanel
                      lessonId={selectedLesson.id}
                      onQuestionsGenerated={(questions) => {
                        toast.success(`Generated ${questions.length} questions`);
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-12 text-center">
                  <BookOpen className="h-12 w-12 mb-4 text-muted/50" />
                  <h3 className="text-lg font-medium mb-1">No Lessons Yet</h3>
                  <p className="text-sm">Add a module and your first lesson to start building the curriculum.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 m-0 overflow-auto">
          <div className="max-w-3xl space-y-6 pb-12">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg font-medium mb-4">Course Settings</h3>

                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <ImageUploadZone
                    bucket="course-thumbnails"
                    path={courseId ?? 'temp'}
                    currentUrl={curriculum?.course?.thumbnail_url}
                    onUploadComplete={(url) => { updateCourse({ courseId: courseId!, thumbnail_url: url }); }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input defaultValue={curriculum?.course?.title ?? ''} onBlur={(e) => updateCourse({ courseId: courseId!, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select defaultValue={curriculum?.course?.category} onValueChange={(v) => updateCourse({ courseId: courseId!, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select defaultValue={curriculum?.course?.level} onValueChange={(v) => updateCourse({ courseId: courseId!, level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue={curriculum?.course?.language ?? 'English'} onValueChange={(v) => updateCourse({ courseId: courseId!, language: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (INR)</Label>
                    <Input type="number" min={0} defaultValue={curriculum?.course?.price ?? 0} onBlur={(e) => updateCourse({ courseId: courseId!, price: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Enrollment Limit</Label>
                    <Input type="number" min={0} placeholder="Unlimited" onBlur={(e) => updateCourse({ courseId: courseId!, enrollment_limit: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked={curriculum?.course?.certificate_enabled} onCheckedChange={(v) => updateCourse({ courseId: courseId!, certificate_enabled: v })} />
                    <Label>Certificate on Completion</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked={curriculum?.course?.is_drip_content} onCheckedChange={(v) => updateCourse({ courseId: courseId!, is_drip_content: v })} />
                    <Label>Drip Content</Label>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Save className="h-3 w-3" />
                  Settings auto-save on change
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">Deleting this course is permanent and cannot be undone. All modules, lessons, and student progress will be removed.</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Course
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Type <strong>DELETE</strong> to confirm permanent deletion of this course and all its content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (courseId) deleteCourse(courseId); }}>DELETE</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 m-0 overflow-auto">
          <div className="flex flex-col items-center justify-center h-full gap-6 p-12">
            <Eye className="h-16 w-16 text-muted-foreground/40" />
            <div className="text-center max-w-md">
              <h3 className="text-lg font-medium mb-2">Course Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">View how this course appears to enrolled students, including the full curriculum and lesson content.</p>
              <Button asChild variant="default">
                <a href={`/catalog/${courseId}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Student View
                </a>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
