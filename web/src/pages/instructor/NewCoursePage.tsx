import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateCourse } from '@/hooks/queries/useInstructor';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/lib/constants';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CourseWizard, WizardStep } from '@/components/instructor/CourseWizard';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUploadZone } from '@/components/assignment/FileUploadZone';

import { TipTapEditor } from '@/components/editor/TipTapEditor';

const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  short_description: z.string().max(200, "Max 200 characters").optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  level: z.string().min(1, "Level is required"),
  tags: z.string(),
  pricing_type: z.enum(['free', 'paid', 'subscription']),
  price: z.number().min(0).optional(),
  language: z.string().min(1, "Language is required"),
  enrollment_limit: z.number().min(0).optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const STEPS = ['Course Details', 'Curriculum', 'Pricing & Settings', 'Review'];

export function NewCoursePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailError, setThumbnailError] = useState('');
  const [moduleCount, setModuleCount] = useState(0);
  const [modules, setModules] = useState<{ title: string; videoUrl: string }[]>([]);
  const { mutateAsync: createCourse, isPending } = useCreateCourse();

  const form = useHookForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      short_description: '',
      description: '',
      category: '',
      level: '',
      tags: '',
      pricing_type: 'free',
      price: 0,
      language: 'English',
      enrollment_limit: 0,
    },
    mode: 'onChange'
  });

  const handleModuleCountChange = (count: number) => {
    setModuleCount(count);
    setModules(prev => {
      const updated = [...prev];
      while (updated.length < count) updated.push({ title: '', videoUrl: '' });
      while (updated.length > count) updated.pop();
      return updated;
    });
  };

  const nextStep = () => {
    if (currentStep === STEPS.length - 1) {
      void form.handleSubmit(onSubmit)();
      return;
    }
    const fieldsToValidate = currentStep === 0
      ? ['title' as const, 'description' as const, 'category' as const, 'level' as const]
      : currentStep === 1
        ? []
        : ['pricing_type' as const, 'price' as const, 'language' as const, 'enrollment_limit' as const];
    void form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      }
    });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const uploadThumbnail = useCallback(async (): Promise<string | null> => {
    if (!thumbnailFile) return null;
    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, thumbnailFile);

    if (error) {
      console.error('Thumbnail upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(filePath);

    return urlData?.publicUrl ?? null;
  }, [thumbnailFile]);

  const onSubmit = async (data: CourseFormValues) => {
    if (!user) return;
    const thumbnailUrl = await uploadThumbnail();
    const courseData = {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      language: data.language,
      price_type: data.pricing_type === 'free' ? 'free' as const : 'paid' as const,
      price: data.price ?? 0,
      thumbnail_url: thumbnailUrl,
      instructor_id: user.id,
    };
    const newCourse = await createCourse(courseData);

    const createdModules = await Promise.all(
      modules.filter(m => m.title.trim()).map((mod, idx) =>
        supabase.from('modules').insert({
          course_id: newCourse.id,
          title: mod.title,
          position: idx,
          is_published: true,
        }).select().single().then(r => r.data)
      )
    );

    await Promise.all(
      createdModules.filter(Boolean).map(mod =>
                  supabase.from('lessons').insert({
                    module_id: mod!.id,
                    course_id: newCourse.id,
                    title: mod!.title,
                    content_type: mod!.videoUrl ? 'video' : 'text',
                    video_url: mod!.videoUrl || null,
                    position: 0,
                    is_published: true,
                  })
      )
    );

    navigate(ROUTES.INSTRUCTOR_COURSE_EDIT(newCourse.id));
  };

  const stepValidity = () => {
    if (currentStep === 0) return form.getValues().title.length >= 5 && form.getValues().description.length >= 20;
    if (currentStep === 1) return moduleCount === 0 || modules.every(m => m.title.trim().length > 0);
    if (currentStep === 2) return form.getValues().pricing_type.length > 0;
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Create New Course"
        description="Follow the steps to set up your new course."
      />

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CourseWizard
                currentStep={currentStep + 1}
                totalSteps={STEPS.length}
                onNext={nextStep}
                onBack={prevStep}
                canNext={stepValidity()}
                isSubmitting={isPending}
              >
                <WizardStep title="Course Details" description="Tell us about your course">
                  <div className="space-y-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl><Input placeholder="e.g. Advanced React Patterns" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="short_description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl><Textarea placeholder="Brief tagline (max 200 chars)" className="min-h-[60px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description</FormLabel>
                        <FormControl>
                          <TipTapEditor
                            content={field.value}
                            onChange={field.onChange}
                            placeholder="Describe what students will learn in detail..."
                            minHeight={200}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div>
                      <FormLabel>Course Thumbnail</FormLabel>
                      <div className="mt-1">
                        <FileUploadZone
                          accept={['.png', '.jpg', '.jpeg', '.webp']}
                          maxMb={5}
                          onFileSelect={(f) => setThumbnailFile(f)}
                          onError={(msg) => setThumbnailError(msg)}
                          selectedFile={thumbnailFile}
                        />
                        {thumbnailError && <p className="text-xs text-red-500 mt-1">{thumbnailError}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="programming">Programming</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="level" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="tags" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl><Input placeholder="react, frontend, web" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </WizardStep>

                <WizardStep title="Curriculum" description="Set up your course modules">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="module-count">Number of Modules</Label>
                      <Input
                        id="module-count"
                        type="number"
                        min={0}
                        max={50}
                        value={moduleCount}
                        onChange={(e) => handleModuleCountChange(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-32"
                      />
                      <p className="text-xs text-muted-foreground">Set to 0 to skip — you can add modules later in the Course Builder.</p>
                    </div>
                    {moduleCount > 0 && (
                      <div className="space-y-4">
                        {modules.map((mod, idx) => (
                          <div key={idx} className="border rounded-lg p-4 space-y-3">
                            <h4 className="font-medium text-sm">Module {idx + 1}</h4>
                            <Input
                              placeholder={`Module ${idx + 1} title`}
                              value={mod.title}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setModules(updated);
                              }}
                            />
                            <div className="space-y-1">
                              <Label className="text-xs">Video URL (YouTube / Vimeo)</Label>
                              <Input
                                placeholder="https://youtube.com/watch?v=..."
                                value={mod.videoUrl}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  updated[idx] = { ...updated[idx], videoUrl: e.target.value };
                                  setModules(updated);
                                }}
                              />
                              <p className="text-xs text-muted-foreground">Optional — upload videos later in the Course Builder.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </WizardStep>

                <WizardStep title="Pricing & Settings" description="Configure pricing and course settings">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="pricing_type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="paid">Paid (One-time)</SelectItem>
                              <SelectItem value="subscription">Subscription Tier</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      {form.watch('pricing_type') !== 'free' && (
                        <FormField control={form.control} name="price" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl><Input type="number" placeholder="499" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="language" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="enrollment_limit" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enrollment Limit (0 = unlimited)</FormLabel>
                          <FormControl><Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </WizardStep>

                <WizardStep title="Review" description="Review your course details before creating">
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Course Title</h4>
                        <p className="text-lg font-medium">{form.getValues().title}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Short Description</h4>
                        <p className="text-sm">{form.getValues().short_description || '—'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                          <p className="text-sm capitalize">{form.getValues().category}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Level</h4>
                          <p className="text-sm capitalize">{form.getValues().level}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Pricing</h4>
                          <p className="text-sm capitalize">
                            {form.getValues().pricing_type === 'free'
                              ? 'Free'
                              : `₹${String(form.getValues().price)}`}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Language</h4>
                          <p className="text-sm">{form.getValues().language}</p>
                        </div>
                      </div>
                      {thumbnailFile && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Thumbnail</h4>
                          <p className="text-sm">{thumbnailFile.name}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click submit to create this course{moduleCount > 0 ? ` with ${moduleCount} module${moduleCount !== 1 ? 's' : ''}` : ''}. It will be immediately visible to all students. You can unpublish or edit later in the Course Builder.
                    </p>
                  </div>
                </WizardStep>
              </CourseWizard>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
