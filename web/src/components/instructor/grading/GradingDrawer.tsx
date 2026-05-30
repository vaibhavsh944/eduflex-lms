import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Submission, RubricCriteria } from '@/lib/types';

interface GradingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Partial<Submission>;
  rubric?: RubricCriteria[];
}

export function GradingDrawer({ open, onOpenChange, submission, rubric }: GradingDrawerProps) {
  const [score, setScore] = useState(submission?.score?.toString() ?? '');
  const [feedback, setFeedback] = useState(submission?.feedback ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rubricScores, setRubricScores] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          score: parseFloat(score) || 0,
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (error) throw error;

      if (rubric && rubric.length > 0) {
        for (const criterion of rubric) {
          const criterionScore = parseFloat(rubricScores[criterion.id] ?? '0');
          await supabase.from('rubric_scores').upsert({
            submission_id: submission.id,
            criterion_id: criterion.id,
            score: criterionScore,
          }, { onConflict: 'submission_id, criterion_id' });
        }
      }

      toast.success('Grade saved');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to save grade');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!submission) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Grade Submission</SheetTitle>
          <SheetDescription>
            {submission.student?.full_name ?? 'Student'} — {submission.assignment?.title ?? 'Assignment'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="rounded-lg border bg-muted/20 p-4">
            <h4 className="text-sm font-medium mb-2">Submission</h4>
            {submission.file_url ? (
              <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                View Submitted File
              </a>
            ) : submission.content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: submission.content }} />
            ) : (
              <p className="text-sm text-muted-foreground">No content submitted</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Submitted {new Date(submission.created_at).toLocaleDateString()}
            </p>
          </div>

          {rubric && rubric.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Rubric Scores</Label>
              {rubric.map((criterion: any) => (
                <div key={criterion.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{criterion.title}</span>
                    <span className="text-xs text-muted-foreground">Max: {criterion.max_points}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                  <Input
                    type="number"
                    max={criterion.max_points}
                    placeholder="Score"
                    value={rubricScores[criterion.id] ?? ''}
                    onChange={e => setRubricScores(prev => ({ ...prev, [criterion.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Score</Label>
            <Input type="number" value={score} onChange={e => setScore(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Feedback</Label>
            <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} />
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : 'Submit Grade'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
