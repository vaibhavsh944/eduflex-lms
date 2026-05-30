import { Command } from 'cmdk';
import type { SearchResult } from '@/lib/types';
import { SearchResultItem } from './SearchResultItem';

interface SearchResultGroupProps {
  heading: string;
  results: SearchResult[];
  onSelect: () => void;
}

export function SearchResultGroup({ heading, results, onSelect }: SearchResultGroupProps) {
  if (results.length === 0) return null;

  return (
    <Command.Group 
      heading={heading} 
      className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
    >
      {results.map((result) => (
        <SearchResultItem key={result.id} result={result} onSelect={onSelect} />
      ))}
    </Command.Group>
  );
}
