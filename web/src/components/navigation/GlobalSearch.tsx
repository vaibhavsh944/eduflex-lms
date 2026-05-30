import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, User } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/hooks/queries/useSearch';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  onClose?: () => void;
}

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const { data: searchResults } = useSearch(debouncedQuery);

  const allResults = searchResults
    ? [...(searchResults.courses ?? []), ...(searchResults.lessons ?? []), ...(searchResults.users ?? [])]
    : [];

  const handleSelect = (url: string) => {
    navigate(url);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    onClose?.();
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || allResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(allResults[selectedIndex].url);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [isOpen, allResults, selectedIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  const groupedResults = searchResults ? {
    courses: searchResults.courses,
    lessons: searchResults.lessons,
    users: searchResults.users,
  } : { courses: [], lessons: [], users: [] };

  let flatIndex = -1;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (debouncedQuery.length >= 2) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search courses, lessons, people... (⌘K)"
          className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isOpen && debouncedQuery.length >= 2 && (
        <div ref={dropdownRef} className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border bg-background shadow-lg">
          {allResults.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {groupedResults.courses.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">Courses</div>
                  {groupedResults.courses.map((item) => {
                    flatIndex++;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.url)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted',
                          selectedIndex === flatIndex && 'bg-muted'
                        )}
                      >
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt="" className="h-10 w-16 rounded object-cover" />
                        ) : (
                          <div className="flex h-10 w-16 items-center justify-center rounded bg-muted">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
              {groupedResults.lessons.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">Lessons</div>
                  {groupedResults.lessons.map((item) => {
                    flatIndex++;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.url)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted',
                          selectedIndex === flatIndex && 'bg-muted'
                        )}
                      >
                        <BookOpen className="h-8 w-8 shrink-0 rounded bg-muted p-1.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
              {groupedResults.users.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">People</div>
                  {groupedResults.users.map((item) => {
                    flatIndex++;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.url)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted',
                          selectedIndex === flatIndex && 'bg-muted'
                        )}
                      >
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
