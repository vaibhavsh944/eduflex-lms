import { useState } from 'react';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  body: string;
  points: number;
  explanation?: string;
  options?: { text: string; is_correct: boolean }[];
  correct_answer?: boolean;
  sample_answer?: string;
}

interface QuizBuilderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (quiz: { title: string; questions: Question[]; passing_score: number; max_attempts: number; randomize_questions: boolean; time_limit_minutes: number }) => void;
  existingQuestions?: Question[];
}

export function QuizBuilderDrawer({ open, onOpenChange, onSave, existingQuestions }: QuizBuilderDrawerProps) {
  const [title, setTitle] = useState('Quiz');
  const [timeLimit, setTimeLimit] = useState('0');
  const [passingScore, setPassingScore] = useState('70');
  const [maxAttempts, setMaxAttempts] = useState('0');
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(existingQuestions ?? []);

  const addQuestion = (type: Question['type']) => {
    const q: Question = {
      id: `q-${Date.now()}`,
      type,
      body: '',
      points: 1,
      options: type === 'mcq' ? [
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ] : undefined,
      correct_answer: type === 'true_false' ? true : undefined,
      sample_answer: type === 'short_answer' ? '' : undefined,
    };
    setQuestions([...questions, q]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateOption = (qId: string, optIdx: number, updates: Partial<{ text: string; is_correct: boolean }>) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId || !q.options) return q;
      const newOptions = q.options.map((o, i) => i === optIdx ? { ...o, ...updates } : o);
      return { ...q, options: newOptions };
    }));
  };

  const handleSave = () => {
    onSave({
      title,
      questions,
      passing_score: parseInt(passingScore) || 70,
      max_attempts: parseInt(maxAttempts) || 0,
      randomize_questions: randomizeQuestions,
      time_limit_minutes: parseInt(timeLimit) || 0,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quiz Builder</SheetTitle>
          <SheetDescription>Create and edit quiz questions</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Quiz Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Time Limit (min)</Label>
                <Input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input type="number" value={passingScore} onChange={e => setPassingScore(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Attempts</Label>
                <Input type="number" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} placeholder="0 = unlimited" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Randomize Questions</Label>
              <Switch checked={randomizeQuestions} onCheckedChange={setRandomizeQuestions} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Questions ({questions.length})</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addQuestion('mcq')}>+ MCQ</Button>
                <Button variant="outline" size="sm" onClick={() => addQuestion('true_false')}>+ T/F</Button>
                <Button variant="outline" size="sm" onClick={() => addQuestion('short_answer')}>+ Short</Button>
              </div>
            </div>

            {questions.map((q, idx) => (
              <Card key={q.id}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">Q{idx + 1}</span>
                    <span className="text-xs text-muted-foreground">
                      {q.type === 'mcq' ? 'MCQ' : q.type === 'true_false' ? 'True/False' : 'Short Answer'}
                    </span>
                    <div className="ml-auto">
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Question</Label>
                    <Textarea
                      value={q.body}
                      onChange={e => updateQuestion(q.id, { body: e.target.value })}
                      placeholder="Enter question text..."
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Points</Label>
                    <Input
                      type="number"
                      value={q.points}
                      onChange={e => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                      className="w-20 h-8"
                    />
                  </div>

                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-2">
                      <Label className="text-xs">Options</Label>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={opt.is_correct}
                            onChange={() => q.options?.forEach((o, i) => updateOption(q.id, i, { is_correct: i === optIdx }))}
                            className="shrink-0"
                          />
                          <Input
                            value={opt.text}
                            onChange={e => updateOption(q.id, optIdx, { text: e.target.value })}
                            placeholder={`Option ${optIdx + 1}`}
                            className="h-8"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'true_false' && (
                    <div className="space-y-2">
                      <Label className="text-xs">Correct Answer</Label>
                      <Select
                        value={String(q.correct_answer ?? true)}
                        onValueChange={v => updateQuestion(q.id, { correct_answer: v === 'true' })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="space-y-2">
                      <Label className="text-xs">Sample Answer (for instructor reference)</Label>
                      <Textarea
                        value={q.sample_answer ?? ''}
                        onChange={e => updateQuestion(q.id, { sample_answer: e.target.value })}
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs">Explanation (shown after quiz)</Label>
                    <Input
                      value={q.explanation ?? ''}
                      onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                      placeholder="Explain the correct answer..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={handleSave} className="w-full">Save Quiz</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
