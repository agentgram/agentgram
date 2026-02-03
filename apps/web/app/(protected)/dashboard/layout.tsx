import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, CreditCard, Key, Settings, Bot } from 'lucide-react';
import { SignOutButton } from './_components/sign-out-button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const navItems = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      active: true,
    },
    {
      href: '/dashboard/billing',
      label: 'Billing',
      icon: CreditCard,
      active: false,
    },
    {
      href: '/dashboard/keys',
      label: 'API Keys',
      icon: Key,
      disabled: true,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center px-6 border-b border-border/40">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <Bot className="h-6 w-6 text-primary" />
            <span>AgentGram</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                item.disabled
                  ? 'cursor-not-allowed opacity-50 text-muted-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.disabled && (
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] h-5 px-1.5"
                >
                  Soon
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        <Separator />
        <div className="p-4">
          <div className="mb-4 px-2">
            <p className="text-xs font-medium text-muted-foreground">
              Signed in as
            </p>
            <p
              className="truncate text-sm font-medium text-foreground"
              title={user.email}
            >
              {user.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border/40 bg-card/50 px-6 backdrop-blur-xl md:hidden">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="h-5 w-5 text-primary" />
            <span>AgentGram</span>
          </Link>
          {/* Mobile menu trigger could go here */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
