import type { SearchResult } from '@/lib/types';
import { Command } from 'cmdk';
import { BookOpen, PlayCircle, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: () => void;
}

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    navigate(result.url);
    onSelect();
  };

  const getIcon = () => {
    switch (result.type) {
      case 'course': return <BookOpen className="h-4 w-4 text-primary" />;
      case 'lesson': return <PlayCircle className="h-4 w-4 text-amber-500" />;
      case 'user': return <User className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <Command.Item
      value={`${result.type}-${result.id}-${result.title}`}
      onSelect={handleSelect}
      className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer aria-selected:bg-muted aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <div className="shrink-0 flex items-center justify-center">
        {result.type === 'user' ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={result.thumbnail_url || undefined} />
            <AvatarFallback>{result.title.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : result.thumbnail_url ? (
          <img src={result.thumbnail_url} alt="" className="h-8 w-12 object-cover rounded-sm" />
        ) : (
          <div className="h-8 w-8 rounded-sm bg-muted flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="truncate font-medium">{result.title}</div>
        <div className="truncate text-xs text-muted-foreground">{result.subtitle}</div>
      </div>
    </Command.Item>
  );
}
