import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question: string;
  quiz_options: { id: string; option_text: string; is_correct: boolean }[];
}

export function QuizPage() {
  const { courseId, quizId } = useParams();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!quizId) throw new Error('No quiz ID');
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, questions:quiz_questions(*, quiz_options(id, option_text, is_correct, order_index))')
        .eq('id', quizId)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!quizId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!quizId || !user) throw new Error('Missing data');
      const { error } = await supabase.from('quiz_attempts').insert({
        quiz_id: quizId,
        user_id: user.id,
        course_id: courseId,
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-player'] });
      toast.success('Quiz submitted!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleAnswer = (qIndex: number, optionId: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [String(qIndex)]: optionId }));
  };

  if (isLoading) return <div className="container px-4 py-8 max-w-2xl space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>;
  if (!quiz) return <div className="container px-4 py-8">Quiz not found</div>;

  const questions: QuizQuestion[] = quiz.questions ?? [];

  return (
    <div className="container px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{quiz.title || 'Quiz'}</h1>
      {questions.length === 0 ? (
        <p className="text-muted-foreground">No questions in this quiz.</p>
      ) : (
        questions.map((q, qIndex) => (
          <Card key={q.id} className="mb-4">
            <CardHeader><CardTitle className="text-base">{q.question}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(q.quiz_options ?? []).map((opt) => (
                  <button key={opt.id} onClick={() => handleAnswer(qIndex, opt.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAnswers[String(qIndex)] === opt.id ? 'border-primary bg-primary/10' : 'border-input hover:border-muted-foreground'
                    } ${submitted && opt.is_correct ? 'border-green-500 bg-green-500/10' : ''}`}>
                    {opt.option_text}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
      {!submitted && questions.length > 0 && (
        <Button onClick={() => submitMutation.mutate()} className="w-full" disabled={submitMutation.isPending}>
          {submitMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      )}
      {submitted && (
        <div className="text-center">
          <p className="text-lg font-semibold">Quiz Submitted!</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(`/learn/${courseId}`)}>Back to Course</Button>
        </div>
      )}
    </div>
  );
}
