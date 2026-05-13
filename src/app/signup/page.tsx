'use client';

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, useUser } from '@/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n-context';

function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 99;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return 99;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isUserLoading && user) router.push('/');
  }, [user, isUserLoading, router]);

  const isUnder15 = useMemo(() => calculateAge(dateOfBirth) < 15, [dateOfBirth]);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isUnder15 && (!parentEmail || !parentEmail.includes('@'))) {
      setError(t('signup.invalidParentEmail'));
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password, options: { data: { username } },
      });
      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('users').insert({
          id: authData.user.id,
          username,
          email: authData.user.email,
          total_study_time: 0,
          companion_clicks: 0,
          date_of_birth: dateOfBirth || null,
          parent_email: isUnder15 ? parentEmail : null,
        });
        router.push('/');
      }
    } catch (err: any) {
      if (err.message?.includes('already registered')) setError(t('signup.alreadyRegistered'));
      else if (err.message?.includes('Password')) setError(t('signup.weakPassword'));
      else setError(err.message || t('common.error'));
      setLoading(false);
    }
  };

  if (isUserLoading || user) {
    return <div className="flex-1 flex items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignUp}>
          <CardHeader>
            <CardTitle className="text-2xl">{t('signup.title')}</CardTitle>
            <CardDescription>{t('signup.description')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('signup.username')}</Label>
              <Input id="username" type="text" placeholder={t('signup.usernamePlaceholder')} required
                value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.email')}</Label>
              <Input id="email" type="email" placeholder="m@example.com" required
                value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.password')}</Label>
              <Input id="password" type="password" required
                value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">{t('signup.dateOfBirth')}</Label>
              <Input id="dob" type="date" required
                value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                disabled={loading} max={new Date().toISOString().split('T')[0]} />
            </div>

            {isUnder15 && dateOfBirth && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{t('signup.parentalControl')}</p>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {t('signup.parentalDescription')}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="parent-email">{t('signup.parentEmail')}</Label>
                  <Input id="parent-email" type="email" placeholder={t('signup.parentEmailPlaceholder')}
                    required={isUnder15} value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)} disabled={loading} />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {t('signup.submit')}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t('signup.hasAccount')}{' '}
              <Link href="/login" className="underline font-medium text-primary">{t('signup.loginLink')}</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
