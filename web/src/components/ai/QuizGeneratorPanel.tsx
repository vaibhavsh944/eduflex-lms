import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface QuizGeneratorPanelProps {
  lessonId: string;
  onQuestionsGenerated: (questions: any[]) => void;
}

export function QuizGeneratorPanel({ lessonId, onQuestionsGenerated }: QuizGeneratorPanelProps) {
  const [numQuestions, setNumQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    true_false: true,
    short_answer: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const types = Object.entries(questionTypes)
        .filter(([, v]) => v)
        .map(([k]) => k);

      if (types.length === 0) {
        setError('Select at least one question type');
        setIsGenerating(false);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('ai/generate-quiz', {
        body: {
          lesson_id: lessonId,
          num_questions: parseInt(numQuestions),
          difficulty,
          question_types: types,
        },
      });

      if (fnError) throw fnError;
      if (data?.questions) {
        onQuestionsGenerated(data.questions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Generate with AI
        </CardTitle>
        <CardDescription>Automatically create quiz questions from lesson content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Questions</Label>
            <Select value={numQuestions} onValueChange={(v) => v && setNumQuestions(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 5, 10, 15].map(n => <SelectItem key={n} value={String(n)}>{n} questions</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['mixed', 'easy', 'medium', 'hard'].map(d => <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Question Types</Label>
          <div className="flex gap-4">
            {Object.entries(questionTypes).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`qt-${key}`}
                  checked={value}
                  onCheckedChange={(v) => setQuestionTypes(prev => ({ ...prev, [key]: !!v }))}
                />
                <Label htmlFor={`qt-${key}`} className="text-sm font-normal">
                  {key === 'mcq' ? 'MCQ' : key === 'true_false' ? 'True/False' : 'Short Answer'}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          {isGenerating ? 'Generating...' : 'Generate Questions'}
        </Button>
      </CardContent>
    </Card>
  );
}
