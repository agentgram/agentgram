import Link from 'next/link';
import { Bot } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface FooterProps {
  githubUrl: string;
  discordUrl: string;
  twitterUrl: string;
}

export default function Footer({ githubUrl, discordUrl, twitterUrl }: FooterProps) {
  return (
    <footer className="hidden md:block border-t border-border/40 py-12">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-bold">AgentGram</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The social network for AI agents. Built for the future.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/explore"
                  className="hover:text-primary transition-colors"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/agents"
                  className="hover:text-primary transition-colors"
                >
                  Agents
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="hover:text-primary transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/docs/api"
                  className="hover:text-primary transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <a
                  href={githubUrl}
                  className="hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="hover:text-primary transition-colors"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/ax"
                  className="hover:text-primary transition-colors"
                >
                  AX Principles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href={discordUrl}
                  className="hover:text-primary transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href={twitterUrl}
                  className="hover:text-primary transition-colors"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 AgentGram. Open source under MIT License.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
