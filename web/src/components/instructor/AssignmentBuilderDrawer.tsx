import { useState } from 'react';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  max_points: number;
}

interface AssignmentBuilderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (assignment: any) => void;
}

export function AssignmentBuilderDrawer({ open, onOpenChange, onSave }: AssignmentBuilderDrawerProps) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [allowTextSubmission, setAllowTextSubmission] = useState(false);
  const [useRubric, setUseRubric] = useState(false);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
    { id: 'c1', title: '', description: '', max_points: 10 },
  ]);

  const addCriterion = () => {
    setRubricCriteria([...rubricCriteria, { id: `c${Date.now()}`, title: '', description: '', max_points: 10 }]);
  };

  const updateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setRubricCriteria(rubricCriteria.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCriterion = (id: string) => {
    setRubricCriteria(rubricCriteria.filter(c => c.id !== id));
  };

  const totalMaxPoints = rubricCriteria.reduce((sum, c) => sum + (c.max_points || 0), 0);

  const handleSave = () => {
    onSave({
      title,
      instructions,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      max_score: parseInt(maxScore) || 100,
      allow_text_submission: allowTextSubmission,
      rubric: useRubric ? rubricCriteria : null,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Assignment Builder</SheetTitle>
          <SheetDescription>Create a new assignment with optional rubric</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assignment Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Week 1 Assignment" />
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={4}
                placeholder="Describe what students need to do..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Score</Label>
                <Input type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Allow Text Submission</Label>
              <Switch checked={allowTextSubmission} onCheckedChange={setAllowTextSubmission} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Rubric</Label>
              <Switch checked={useRubric} onCheckedChange={setUseRubric} />
            </div>

            {useRubric && (
              <div className="space-y-3">
                {rubricCriteria.map((c, idx) => (
                  <div key={c.id} className="flex items-start gap-2 rounded-lg border p-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={c.title}
                        onChange={e => updateCriterion(c.id, { title: e.target.value })}
                        placeholder={`Criterion ${idx + 1}`}
                      />
                      <Input
                        value={c.description}
                        onChange={e => updateCriterion(c.id, { description: e.target.value })}
                        placeholder="Description"
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-xs shrink-0">Max points:</Label>
                        <Input
                          type="number"
                          value={c.max_points}
                          onChange={e => updateCriterion(c.id, { max_points: parseFloat(e.target.value) || 0 })}
                          className="w-24 h-8"
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCriterion(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addCriterion}>
                  <Plus className="h-4 w-4 mr-2" /> Add Criterion
                </Button>
                <p className="text-xs text-muted-foreground">Total max points: {totalMaxPoints}</p>
              </div>
            )}
          </div>

          <Button onClick={handleSave} className="w-full">Save Assignment</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
