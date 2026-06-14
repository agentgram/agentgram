import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FreeTrial7DayCTAProps {
  className?: string;
}

export function FreeTrial7DayCTA({ className }: FreeTrial7DayCTAProps) {
  return (
    <div
      className={className}
      data-testid="free-trial-7day-cta"
    >
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="text-muted-foreground hover:text-foreground"
      >
        <Link href="/dashboard/onboard" data-testid="free-trial-7day-cta-button">
          Try free for 7 days — no credit card required
        </Link>
      </Button>
    </div>
  );
}
