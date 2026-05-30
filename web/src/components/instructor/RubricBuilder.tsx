import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RubricCriteria } from '@/lib/types';

interface RubricBuilderProps {
  criteria: RubricCriteria[];
  onChange: (criteria: RubricCriteria[]) => void;
}

export function RubricBuilder({ criteria, onChange }: RubricBuilderProps) {
  const addCriterion = () => {
    onChange([
      ...criteria,
      { id: crypto.randomUUID(), title: '', description: '', max_points: 10, position: criteria.length },
    ]);
  };

  const removeCriterion = (index: number) => {
    onChange(criteria.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, field: keyof RubricCriteria, value: string | number | undefined) => {
    const updated = criteria.map((c, i) =>
      i === index ? { ...c, [field]: value } : c,
    );
    onChange(updated);
  };

  const totalPoints = criteria.reduce((sum, c) => sum + (c.max_points || c.points || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Rubric Criteria</Label>
          <p className="text-xs text-muted-foreground">
            Total points: <strong>{totalPoints}</strong>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addCriterion} className="gap-1">
          <Plus className="h-3 w-3" /> Add Criterion
        </Button>
      </div>

      {criteria.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No criteria defined. Click "Add Criterion" to start building your rubric.
        </p>
      ) : (
        <div className="space-y-3">
          {criteria.map((criterion, index) => (
            <div key={criterion.id || index} className="flex items-start gap-3 rounded-lg border p-3">
              <GripVertical className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />

              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-[1fr_100px] gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Criterion</Label>
                    <Input
                      value={criterion.title || criterion.criterion || ''}
                      onChange={(e) => { updateCriterion(index, 'title', e.target.value); }}
                      placeholder="e.g., Thesis Clarity"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Max Points</Label>
                    <Input
                      type="number"
                      value={criterion.max_points ?? criterion.points ?? 0}
                      onChange={(e) => { updateCriterion(index, 'max_points', parseFloat(e.target.value) || 0); }}
                      min={0}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={criterion.description || ''}
                    onChange={(e) => { updateCriterion(index, 'description', e.target.value); }}
                    placeholder="Describe what distinguishes excellent from poor performance..."
                  />
                </div>
              </div>

              <Button variant="ghost" size="icon" className="mt-1 h-7 w-7 shrink-0" onClick={() => { removeCriterion(index); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
