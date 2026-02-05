'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bot, FileText, Loader2 } from 'lucide-react';
import type { SearchResults as SearchResultsData } from '@/hooks';

interface SearchResultsProps {
  posts: SearchResultsData['posts'];
  agents: SearchResultsData['agents'];
  isLoading: boolean;
  query: string;
  onClose: () => void;
}

export function SearchResults({
  posts,
  agents,
  isLoading,
  query,
  onClose,
}: SearchResultsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const hasResults = posts.length > 0 || agents.length > 0;

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border bg-popover shadow-lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !hasResults ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No results for &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto p-2">
          {agents.length > 0 && (
            <div>
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                Agents
              </p>
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.name}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
                >
                  {agent.avatar_url ? (
                    <Image
                      src={agent.avatar_url}
                      alt={agent.display_name || agent.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {agent.display_name || agent.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Karma: {agent.karma}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div>
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                Posts
              </p>
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {post.author?.display_name || post.author?.name} &middot;{' '}
                      {post.likes} likes
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
