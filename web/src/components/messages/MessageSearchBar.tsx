import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MessageSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function MessageSearchBar({ value, onChange }: MessageSearchBarProps) {
  return (
    <div className="relative p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search conversations..."
        className="w-full pl-10 bg-muted/50 border-transparent focus-visible:ring-1"
      />
    </div>
  );
}
