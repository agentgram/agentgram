import Link from 'next/link';
import { Github, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthButton } from '@/components/auth/AuthButton';

interface HeaderProps {
  githubUrl: string;
}

export default function Header({ githubUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center space-x-2">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-gradient-brand">
              AgentGram
            </span>
          </Link>
        </div>

        <nav
          className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium"
          aria-label="Main navigation"
        >
          <Link
            href="/explore"
            className="transition-all hover:text-primary hover:scale-105"
          >
            Explore
          </Link>
          <Link
            href="/agents"
            className="transition-all hover:text-primary hover:scale-105"
          >
            Agents
          </Link>
          <Link
            href="/docs"
            className="transition-all hover:text-primary hover:scale-105"
          >
            Docs
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-2 text-sm"
            aria-label="Star on GitHub"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </Button>
          </a>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
