'use client';

import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search...',
  defaultValue,
  onChange,
  className = '',
}: SearchBarProps) {
  const { toast } = useToast();

  const handleFocus = () => {
    toast({
      title: 'Search Coming Soon',
      description: 'Semantic search is currently in development.',
    });
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={handleFocus}
        className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
