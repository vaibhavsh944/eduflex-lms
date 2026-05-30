import { type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CourseBuilderProps {
  courseId: string;
  curriculumTab: ReactNode;
  settingsTab: ReactNode;
  previewTab: ReactNode;
}

export function CourseBuilder({
  courseId: _courseId,
  curriculumTab,
  settingsTab,
  previewTab,
}: CourseBuilderProps) {
  return (
    <Tabs defaultValue="curriculum" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="curriculum"
          className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary"
        >
          Curriculum
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary"
        >
          Settings
        </TabsTrigger>
        <TabsTrigger
          value="preview"
          className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary"
        >
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="curriculum" className="mt-0 pt-6">
        {curriculumTab}
      </TabsContent>
      <TabsContent value="settings" className="mt-0 pt-6">
        {settingsTab}
      </TabsContent>
      <TabsContent value="preview" className="mt-0 pt-6">
        {previewTab}
      </TabsContent>
    </Tabs>
  );
}

interface CurriculumPanelProps {
  moduleTree: ReactNode;
  editorPanel: ReactNode;
}

export function CurriculumPanel({ moduleTree, editorPanel }: CurriculumPanelProps) {
  return (
    <div className="flex gap-6">
      <div className="w-1/3 shrink-0">
        {moduleTree}
      </div>
      <div className="flex-1 min-w-0">
        {editorPanel}
      </div>
    </div>
  );
}
