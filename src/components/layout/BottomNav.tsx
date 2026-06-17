'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sprout, Trophy, BarChart3, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/supabase';
import { useLanguage } from '@/lib/i18n-context';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useLanguage();

  if (!user) return null;

  const navItems = [
    { href: '/',             label: t('nav.dashboard'),    icon: LayoutDashboard },
    { href: '/garden',       label: t('nav.garden'),       icon: Sprout },
    { href: '/achievements', label: t('nav.achievements'), icon: Trophy },
    { href: '/analysis',     label: t('nav.analysis'),     icon: BarChart3 },
    { href: '/study-plan',   label: t('nav.studyPlan'),    icon: BookOpen },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label="Mobile navigation"
    >
      <div
        className="flex items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 py-2 px-1 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
            >
              <Icon
                className={cn('h-5 w-5 shrink-0 transition-all', isActive && 'scale-110')}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className="w-full truncate text-center leading-none">{label}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
