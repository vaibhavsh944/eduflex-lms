import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingMessage({ content, isStreaming, className }: StreamingMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (content.length > prevLengthRef.current) {
      setDisplayedText(content);
      prevLengthRef.current = content.length;
    }
  }, [content]);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(content);
      prevLengthRef.current = content.length;
    }
  }, [isStreaming, content]);

  if (!displayedText && isStreaming) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
      </div>
    );
  }

  if (!displayedText) return null;

  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-text-bottom" />
      )}
    </div>
  );
}
