'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, useUser } from '@/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isUserLoading && user) router.push('/');
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        let msg = t('login.invalidCredentials');
        if (error.message.includes('Email not confirmed')) msg = t('login.emailNotConfirmed');
        else if (error.message.includes('Too many requests')) msg = t('login.tooManyRequests');
        toast({ variant: 'destructive', title: t('login.failed'), description: msg });
        setLoading(false);
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: t('login.failed'), description: err?.message || t('common.error') });
      setLoading(false);
    }
  };

  if (isUserLoading || user) {
    return <div className="flex-1 flex items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
            <CardDescription>{t('login.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input id="email" type="email" placeholder="m@example.com" required
                value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('login.password')}</Label>
                <Link href="/reset-password" className="text-xs text-primary hover:underline">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <Input id="password" type="password" required
                value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {t('login.submit')}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t('login.noAccount')}{' '}
              <Link href="/signup" className="underline font-medium text-primary">{t('login.signUpLink')}</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
