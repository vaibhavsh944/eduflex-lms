import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Loader2, X } from 'lucide-react';
import { useSearch } from '@/hooks/queries/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchResultGroup } from './SearchResultGroup';
import { Button } from '@/components/ui/button';

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isLoading } = useSearch(debouncedQuery);

  // Clear query on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => setQuery(''), 200);
    }
  }, [open]);

  // Command+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const hasResults = results && (results.courses.length > 0 || results.lessons.length > 0 || results.users.length > 0);
  const isTyping = query !== debouncedQuery;
  const showLoading = (isLoading || isTyping) && query.length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl gap-0">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <DialogDescription className="sr-only">Search courses, lessons, and people</DialogDescription>
        
        <Command 
          className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"
          shouldFilter={false} // We do server-side filtering via useSearch
        >
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input 
              value={query}
              onValueChange={setQuery}
              placeholder="Search courses, people, lessons..." 
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {query && (
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setQuery('')}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            {showLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </div>
            )}
            
            {!showLoading && query.length >= 2 && !hasResults && (
              <Command.Empty className="py-6 text-center text-sm">
                No results found for "{query}".
              </Command.Empty>
            )}

            {!showLoading && hasResults && results && (
              <>
                <SearchResultGroup 
                  heading="Courses" 
                  results={results.courses} 
                  onSelect={() => onOpenChange(false)} 
                />
                <SearchResultGroup 
                  heading="Lessons" 
                  results={results.lessons} 
                  onSelect={() => onOpenChange(false)} 
                />
                <SearchResultGroup 
                  heading="People" 
                  results={results.users} 
                  onSelect={() => onOpenChange(false)} 
                />
              </>
            )}

            {query.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </div>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
