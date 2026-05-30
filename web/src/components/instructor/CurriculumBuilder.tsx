import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Module, Lesson } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { GripVertical, Plus, Edit2, Trash2, Video, FileText, FileDown, CheckCircle } from 'lucide-react';

interface CurriculumBuilderProps {
  modules: Module[];
  lessons: Lesson[];
  onReorder: (modules: Module[], lessons: Lesson[]) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onAddLesson: (moduleId: string) => void;
  onAddModule: () => void;
  onDeleteModule: (moduleId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  selectedLessonId?: string;
}

function SortableLessonItem({ lesson, isSelected, onClick, onDelete }: { lesson: Lesson, isSelected: boolean, onClick: () => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = () => {
    switch (lesson.type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <FileDown className="h-4 w-4" />;
      case 'quiz': return <CheckCircle className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-2 p-3 bg-background border rounded-md mb-2 cursor-pointer group ${isSelected ? 'ring-2 ring-primary border-transparent' : 'hover:border-primary/50'}`}
      onClick={onClick}
    >
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="text-muted-foreground">
        {getIcon()}
      </div>
      <span className="flex-1 text-sm font-medium truncate">{lesson.title}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        <Trash2 className="h-3 w-3 text-destructive" />
      </Button>
      {lesson.is_free_preview && (
        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded uppercase font-semibold">Free</span>
      )}
    </div>
  );
}

function SortableModuleItem({ 
  module, 
  lessons, 
  onSelectLesson, 
  onAddLesson,
  onDeleteModule,
  onDeleteLesson,
  selectedLessonId 
}: { 
  module: Module, 
  lessons: Lesson[],
  onSelectLesson: (lesson: Lesson) => void,
  onAddLesson: (moduleId: string) => void,
  onDeleteModule: (moduleId: string) => void,
  onDeleteLesson: (lessonId: string) => void,
  selectedLessonId?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-muted/50 border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
          <h3 className="font-semibold">{module.title}</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onAddLesson(module.id)}><Plus className="h-4 w-4 mr-1" /> Lesson</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDeleteModule(module.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      
      <div className="pl-6 space-y-1">
        <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {lessons.map(lesson => (
            <SortableLessonItem 
              key={lesson.id} 
              lesson={lesson} 
              isSelected={selectedLessonId === lesson.id}
              onClick={() => onSelectLesson(lesson)} 
              onDelete={() => onDeleteLesson(lesson.id)}
            />
          ))}
        </SortableContext>
        <Button variant="outline" size="sm" className="w-full mt-2 border-dashed" onClick={() => onAddLesson(module.id)}>
          <Plus className="h-4 w-4 mr-2" /> Add Lesson
        </Button>
      </div>
    </div>
  );
}

export function CurriculumBuilder({ modules, lessons, onReorder, onSelectLesson, onAddLesson, onAddModule, onDeleteModule, onDeleteLesson, selectedLessonId }: CurriculumBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isModule = modules.some(m => m.id === active.id);
    if (isModule) {
      const oldIndex = modules.findIndex(m => m.id === active.id);
      const newIndex = modules.findIndex(m => m.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newModules = arrayMove(modules, oldIndex, newIndex).map((m, i) => ({ ...m, position: i }));
      onReorder(newModules, lessons);
    } else {
      const oldIndex = lessons.findIndex(l => l.id === active.id);
      const newIndex = lessons.findIndex(l => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newLessons = arrayMove(lessons, oldIndex, newIndex).map((l, i) => ({ ...l, order_index: i }));
      onReorder(modules, newLessons);
    }
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {modules.map(module => (
            <SortableModuleItem 
              key={module.id} 
              module={module} 
              lessons={lessons.filter(l => l.module_id === module.id).sort((a,b) => a.order_index - b.order_index)} 
              onSelectLesson={onSelectLesson}
              onAddLesson={onAddLesson}
              onDeleteModule={onDeleteModule}
              onDeleteLesson={onDeleteLesson}
              selectedLessonId={selectedLessonId}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button variant="outline" className="w-full border-dashed py-8" onClick={onAddModule}>
        <Plus className="h-5 w-5 mr-2" /> Add New Module
      </Button>
    </div>
  );
}
