import { useState, useCallback } from 'react';

export function useStream() {
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = useCallback(async (
    functionName: string,
    body: object,
    onComplete?: (fullText: string) => void
  ) => {
    setStreamedText('');
    setIsStreaming(true);
    let accumulated = '';

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]');
        for (const line of lines) {
          try {
            const json = JSON.parse(line.replace('data: ', ''));
            if (json.type === 'content_block_delta' && json.delta?.text) {
              accumulated += json.delta.text;
              setStreamedText(accumulated);
            }
          } catch { /* skip */ }
        }
      }

      onComplete?.(accumulated);
    } catch (err) {
      console.error('Stream error:', err);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { streamedText, isStreaming, startStream };
}
