import { MessageSquare } from 'lucide-react';

export function EmptyThreadState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/10">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">Your Messages</h3>
      <p className="text-muted-foreground max-w-sm">
        Select a conversation from the list to start messaging, or click the New Message button to connect with someone.
      </p>
    </div>
  );
}
