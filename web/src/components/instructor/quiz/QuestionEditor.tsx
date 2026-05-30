import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import type { QuestionType } from '@/lib/types';

interface QuestionEditorProps {
  question: {
    id?: string;
    type: QuestionType;
    text: string;
    options: string[];
    correct: string | string[];
    points: number;
    explanation: string;
  };
  onChange: (question: QuestionEditorProps['question']) => void;
  onDelete?: () => void;
}

export function QuestionEditor({ question, onChange, onDelete }: QuestionEditorProps) {
  const [questionType, setQuestionType] = useState<QuestionType>(question.type);

  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    onChange({
      ...question,
      type,
      options: type === 'mcq' ? ['', ''] : [],
      correct: type === 'true_false' ? 'true' : '',
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const options = [...question.options];
    options[index] = value;
    onChange({ ...question, options });
  };

  const addOption = () => {
    onChange({ ...question, options: [...question.options, ''] });
  };

  const removeOption = (index: number) => {
    const options = question.options.filter((_, i) => i !== index);
    const correct = Array.isArray(question.correct)
      ? question.correct.filter(c => c !== question.options[index])
      : question.correct;
    onChange({ ...question, options, correct });
  };

  const setCorrect = (value: string) => {
    onChange({ ...question, correct: value });
  };

  const toggleCorrectMulti = (value: string) => {
    const current = Array.isArray(question.correct) ? question.correct : [];
    const updated = current.includes(value)
      ? current.filter(c => c !== value)
      : [...current, value];
    onChange({ ...question, correct: updated });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={(v) => { if (v) handleTypeChange(v); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <TipTapEditor
              content={question.text}
              onChange={(html) => { onChange({ ...question, text: html }); }}
              placeholder="Enter your question..."
              minHeight={80}
            />
          </div>

          <div className="space-y-2">
            <Label>Points</Label>
            <Input
              type="number"
              value={question.points}
              onChange={(e) => { onChange({ ...question, points: parseInt(e.target.value) || 0 }); }}
              className="w-24"
              min={0}
            />
          </div>

          {questionType === 'mcq' && (
            <div className="space-y-2">
              <Label>Answer Options</Label>
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(question.correct) && question.correct.includes(opt)}
                    onChange={() => { toggleCorrectMulti(opt); }}
                    className="h-4 w-4 shrink-0"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => { handleOptionChange(i, e.target.value); }}
                    placeholder={`Option ${String(i + 1)}`}
                  />
                  {question.options.length > 2 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { removeOption(i); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption} className="gap-1">
                <Plus className="h-3 w-3" /> Add Option
              </Button>
            </div>
          )}

          {questionType === 'true_false' && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <RadioGroup value={String(question.correct)} onValueChange={(v) => { setCorrect(v); }}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="true" id="tf-true" />
                  <Label htmlFor="tf-true">True</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="false" id="tf-false" />
                  <Label htmlFor="tf-false">False</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {questionType === 'short_answer' && (
            <div className="space-y-2">
              <Label>Sample Correct Answer</Label>
              <Textarea
                value={typeof question.correct === 'string' ? question.correct : ''}
                onChange={(e) => { setCorrect(e.target.value); }}
                placeholder="Provide a reference answer..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Explanation (optional, shown after quiz submission)</Label>
            <Textarea
              value={question.explanation}
              onChange={(e) => { onChange({ ...question, explanation: e.target.value }); }}
              placeholder="Explain why this answer is correct..."
            />
          </div>
        </div>

        {onDelete && (
          <Button variant="ghost" size="icon" onClick={() => { onDelete(); }} className="h-8 w-8 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
