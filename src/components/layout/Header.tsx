'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, supabase } from '@/supabase';
import { avatarOptions } from '@/lib/avatars';
import { useLanguage } from '@/lib/i18n-context';

export default function Header() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const { lang, setLang, t } = useLanguage();

  const navItems = [
    { href: '/',             label: t('nav.dashboard') },
    { href: '/garden',       label: t('nav.garden') },
    { href: '/achievements', label: t('nav.achievements') },
    { href: '/analysis',     label: t('nav.analysis') },
    { href: '/study-plan',   label: t('nav.studyPlan') },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg text-foreground">Focus Flow</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-2 text-sm flex-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname === item.href ? 'text-foreground font-semibold' : 'text-foreground/60'
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Language switcher */}
          <div className="flex items-center rounded-full border border-border bg-muted p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang('en')}
              className={cn(
                'rounded-full px-2.5 py-1 transition-all',
                lang === 'en'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLang('tr')}
              className={cn(
                'rounded-full px-2.5 py-1 transition-all',
                lang === 'tr'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              TR
            </button>
          </div>

          {isUserLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={
                        user.user_metadata?.avatar_url ||
                        (() => {
                          const avatarId = user.user_metadata?.avatar_id || 'adventurer';
                          const avatar = avatarOptions.find(av => av.id === avatarId) || avatarOptions[0];
                          return avatar.url(user.id);
                        })()
                      }
                      alt={user.user_metadata?.username || 'User'}
                    />
                    <AvatarFallback>
                      {(user.user_metadata?.username || user.email)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.username || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('user.profile')}</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('user.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('user.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">{t('user.login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t('user.signup')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
