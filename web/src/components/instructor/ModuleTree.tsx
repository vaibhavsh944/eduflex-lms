import { useState } from 'react';
import { GripVertical, ChevronRight, ChevronDown, Plus, Edit, Trash2, FileText, Video, File, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Module, Lesson } from '@/lib/types';

interface ModuleTreeProps {
  modules: (Module & { lessons: Lesson[] })[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  onAddModule: (title: string) => void;
  onAddLesson: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onRenameModule: (moduleId: string, title: string) => void;
  isLoading?: boolean;
}

export function ModuleTree({
  modules,
  selectedLessonId,
  onSelectLesson,
  onAddModule,
  onAddLesson,
  onDeleteModule,
  onDeleteLesson,
  onRenameModule,
  isLoading,
}: ModuleTreeProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.id)));
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const lessonIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'video': return <Video className="h-3.5 w-3.5" />;
      case 'pdf': return <File className="h-3.5 w-3.5" />;
      case 'quiz': case 'assignment': return <HelpCircle className="h-3.5 w-3.5" />;
      default: return <FileText className="h-3.5 w-3.5" />;
    }
  };

  const handleAddModule = () => {
    if (newModuleTitle.trim()) {
      onAddModule(newModuleTitle.trim());
      setNewModuleTitle('');
      setIsAddingModule(false);
    }
  };

  const startRename = (module: Module) => {
    setEditingModuleId(module.id);
    setEditTitle(module.title);
  };

  const handleRename = (moduleId: string) => {
    if (editTitle.trim()) {
      onRenameModule(moduleId, editTitle.trim());
    }
    setEditingModuleId(null);
    setEditTitle('');
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-3 space-y-1">
      {modules.map((mod) => (
        <div key={mod.id}>
          <div className="group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-muted/50">
            <button onClick={() => { toggleModule(mod.id); }} className="shrink-0">
              {expandedModules.has(mod.id) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />

            {editingModuleId === mod.id ? (
              <Input
                value={editTitle}
                onChange={(e) => { setEditTitle(e.target.value); }}
              onBlur={() => { handleRename(mod.id); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleRename(mod.id); } if (e.key === 'Escape') { setEditingModuleId(null); } }}
                className="h-7 text-sm"
                autoFocus
              />
            ) : (
              <span className="flex-1 truncate text-sm font-medium">{mod.title}</span>
            )}

            <span className="text-xs text-muted-foreground shrink-0">
              {mod.lessons.length}
            </span>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { startRename(mod); }} title="Rename">
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { onDeleteModule(mod.id); }} title="Delete">
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>

          {expandedModules.has(mod.id) && (
            <div className="ml-4 space-y-0.5 border-l pl-2">
  {mod.lessons.map((lesson) => (
              <LessonTreeItem
                key={lesson.id}
                lesson={lesson}
                isSelected={selectedLessonId === lesson.id}
                onSelect={() => { onSelectLesson(lesson.id); }}
                onDelete={() => { onDeleteLesson(lesson.id); }}
                icon={lessonIcon(lesson.type)}
              />
              ))}
              <Button
                variant="ghost"
                size="sm"
              className="w-full justify-start gap-2 text-xs text-muted-foreground"
              onClick={() => { onAddLesson(mod.id); }}
              >
                <Plus className="h-3 w-3" />
                Add Lesson
              </Button>
            </div>
          )}
        </div>
      ))}

      {isAddingModule ? (
        <div className="flex items-center gap-2 px-2">
          <Input
            value={newModuleTitle}
            onChange={(e) => { setNewModuleTitle(e.target.value); }}
            placeholder="Module name..."
            className="h-8 text-sm"
            autoFocus
              onKeyDown={(e) => {
              if (e.key === 'Enter') { handleAddModule(); }
              if (e.key === 'Escape') { setIsAddingModule(false); }
            }}
          />
          <Button size="sm" className="h-8" onClick={handleAddModule}>✓</Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sm text-muted-foreground"
          onClick={() => { setIsAddingModule(true); }}
        >
          <Plus className="h-4 w-4" />
          Add Module
        </Button>
      )}
    </div>
  );
}

interface LessonTreeItemProps {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  icon: React.ReactNode;
}

export function LessonTreeItem({ lesson, isSelected, onSelect, onDelete, icon }: LessonTreeItemProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50',
      )}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="flex-1 truncate">{lesson.title}</span>
      <span className="text-xs text-muted-foreground">{lesson.duration_minutes}m</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 opacity-0 group-hover:opacity-100"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <Trash2 className="h-3 w-3 text-destructive" />
      </Button>
    </div>
  );
}
