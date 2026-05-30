import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { useSendMessage } from '@/hooks/queries/useMessages';

interface MessageComposerProps {
  threadId: string;
}

export function MessageComposer({ threadId }: MessageComposerProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const handleSend = () => {
    if (!text.trim() || isPending) return;
    sendMessage({ threadId, body: text.trim() }, {
      onSuccess: () => {
        setText('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'inherit';
          textareaRef.current.focus();
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-end gap-2 bg-muted/50 rounded-xl border p-2 focus-within:ring-1 focus-within:ring-primary">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 max-h-[150px] min-h-[40px] resize-none bg-transparent py-2 px-3 text-sm outline-none placeholder:text-muted-foreground"
          rows={1}
        />
        <Button 
          size="icon" 
          className="rounded-full h-10 w-10 shrink-0" 
          onClick={handleSend}
          disabled={!text.trim() || isPending}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
        </Button>
      </div>
      <div className="text-[10px] text-muted-foreground mt-2 text-right px-2">
        Press <kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> to send, <kbd className="font-mono bg-muted px-1 rounded">Shift + Enter</kbd> for new line
      </div>
    </div>
  );
}
