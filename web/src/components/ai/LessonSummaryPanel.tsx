import { useState, useEffect } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

interface LessonSummaryPanelProps {
  lessonId: string;
}

export function LessonSummaryPanel({ lessonId }: LessonSummaryPanelProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai/summarize-lesson', {
        body: { lesson_id: lessonId },
      });
      if (fnError) throw fnError;
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-3">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchSummary} disabled={isLoading}>
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {error || 'Generate a summary of this lesson to review key points.'}
            </p>
            <Button variant="outline" onClick={fetchSummary} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Summarize this lesson'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
