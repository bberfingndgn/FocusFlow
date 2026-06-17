'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useUser, useDoc, useCollection } from '@/supabase';
import { useLanguage } from '@/lib/i18n-context';
import { SECONDS_TO_GROW_FLOWER } from '@/lib/constants';
import { checkIsUnder15, cn } from '@/lib/utils';
import type { StudySession, UserProfile, GrownFlower } from '@/lib/types';
import GardenIsometricView from '@/components/garden/GardenIsometricView';

type Period = 'day' | 'week' | 'month' | 'year';

const SUBJECT_FLOWER_TYPES: Record<string, string> = {
  'Mathematics':    'sunflower',
  'Science':        'rose',
  'Social Studies': 'tulip',
  'English':        'daisy',
};

function checkInPeriod(d: Date, period: Period, c: Date): boolean {
  switch (period) {
    case 'day':
      return d.toDateString() === c.toDateString();
    case 'week': {
      const start = new Date(c);
      start.setDate(c.getDate() - c.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    }
    case 'month':
      return d.getMonth() === c.getMonth() && d.getFullYear() === c.getFullYear();
    case 'year':
      return d.getFullYear() === c.getFullYear();
  }
}

export default function GardenPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [period, setPeriod] = useState<Period>('day');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [subject, setSubject] = useState<string>('all');

  useEffect(() => {
    if (!isUserLoading && !user) router.push('/login');
  }, [user, isUserLoading, router]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(
    'users', user?.id || null, !!user
  );

  const { data: studySessions, isLoading: isSessionsLoading } = useCollection<StudySession>(
    'study_sessions',
    user ? [{ column: 'user_id', value: user.id }] : undefined,
    !!user
  );

  const isUnder15 = checkIsUnder15(userProfile?.date_of_birth);

  const effectiveSessions = useMemo(() => {
    if (!studySessions) return [];
    if (!isUnder15) return studySessions;
    return studySessions.filter(s => s.is_verified === true);
  }, [studySessions, isUnder15]);

  const grownFlowers = useMemo((): GrownFlower[] => {
    if (!userProfile) return [];
    const totalStudyTime = userProfile.total_study_time || 0;
    const totalFlowers = Math.floor(totalStudyTime / SECONDS_TO_GROW_FLOWER);
    if (totalFlowers === 0) return [];

    const sorted = [...effectiveSessions].sort(
      (a, b) =>
        new Date(a.start_time || a.created_at || '').getTime() -
        new Date(b.start_time || b.created_at || '').getTime()
    );

    const flowers: GrownFlower[] = [];
    let accumulatedSeconds = 0;
    let flowerIndex = 0;

    for (const session of sorted) {
      if (flowerIndex >= totalFlowers) break;
      let remaining = session.duration * 60;
      while (remaining > 0 && flowerIndex < totalFlowers) {
        const nextThreshold = (flowerIndex + 1) * SECONDS_TO_GROW_FLOWER;
        const toNext = nextThreshold - accumulatedSeconds;
        if (remaining >= toNext) {
          remaining -= toNext;
          accumulatedSeconds = nextThreshold;
          const subject = session.subject_id || (session as any).subjectId || 'Mathematics';
          flowers.push({
            id: `flower-${flowerIndex}`,
            subject,
            flowerTypeId: SUBJECT_FLOWER_TYPES[subject] || 'rose',
            grownAt: new Date(session.end_time || session.start_time || session.created_at || new Date()),
          });
          flowerIndex++;
        } else {
          accumulatedSeconds += remaining;
          remaining = 0;
        }
      }
    }

    if (flowers.length < totalFlowers) {
      const lastSession = sorted[sorted.length - 1];
      const subject = lastSession?.subject_id || (lastSession as any)?.subjectId || 'Mathematics';
      while (flowers.length < totalFlowers) {
        flowers.push({
          id: `flower-${flowers.length}`,
          subject,
          flowerTypeId: SUBJECT_FLOWER_TYPES[subject] || 'rose',
          grownAt: new Date(lastSession?.end_time || lastSession?.created_at || new Date()),
        });
      }
    }

    return flowers;
  }, [userProfile, effectiveSessions]);

  const filteredFlowers = useMemo(
    () => grownFlowers
      .filter(f => checkInPeriod(new Date(f.grownAt), period, currentDate))
      .filter(f => subject === 'all' || f.subject === subject),
    [grownFlowers, period, currentDate, subject]
  );

  const filteredSessions = useMemo(
    () => effectiveSessions
      .filter(s => checkInPeriod(new Date(s.start_time || s.created_at || ''), period, currentDate))
      .filter(s => subject === 'all' || s.subject_id === subject),
    [effectiveSessions, period, currentDate, subject]
  );

  const periodHours = useMemo(() => {
    const mins = filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return (mins / 60).toFixed(1);
  }, [filteredSessions]);

  function navigate(dir: 1 | -1) {
    setCurrentDate(prev => {
      const d = new Date(prev);
      switch (period) {
        case 'day':   d.setDate(d.getDate() + dir);         break;
        case 'week':  d.setDate(d.getDate() + dir * 7);     break;
        case 'month': d.setMonth(d.getMonth() + dir);       break;
        case 'year':  d.setFullYear(d.getFullYear() + dir); break;
      }
      return d;
    });
  }

  function getPeriodLabel(): string {
    const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
    const today = new Date();
    switch (period) {
      case 'day': {
        const isToday = currentDate.toDateString() === today.toDateString();
        const label = currentDate.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
        return isToday ? `${label} (${t('garden.today')})` : label;
      }
      case 'week': {
        const start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
      }
      case 'month':
        return currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      case 'year':
        return currentDate.getFullYear().toString();
    }
  }

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'day',   label: t('garden.day') },
    { key: 'week',  label: t('garden.week') },
    { key: 'month', label: t('garden.month') },
    { key: 'year',  label: t('garden.year') },
  ];

  const SUBJECTS = [
    { key: 'all',            label: t('garden.allSubjects'), emoji: '🌸' },
    { key: 'Mathematics',    label: t('garden.math'),        emoji: '🔵' },
    { key: 'Science',        label: t('garden.science'),     emoji: '🟣' },
    { key: 'Social Studies', label: t('garden.social'),      emoji: '🩷' },
    { key: 'English',        label: t('garden.english'),     emoji: '🟡' },
  ];

  const isLoading = isUserLoading || isProfileLoading || (!!user && isSessionsLoading);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold font-headline text-primary">{t('garden.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('garden.subtitle')}</p>
      </div>

      {/* Period tabs */}
      <div className="flex justify-center mb-3">
        <div className="flex items-center rounded-full border border-border bg-muted p-0.5 text-sm font-semibold gap-0.5">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setPeriod(key); setCurrentDate(new Date()); }}
              className={cn(
                'rounded-full px-3 py-1.5 transition-all',
                period === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject tabs */}
      <div className="flex justify-center mb-4 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 min-w-max">
          {SUBJECTS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setSubject(key)}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap',
                subject === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-1.5 hover:bg-muted transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <span
          className="text-sm font-medium text-foreground min-w-[200px] text-center"
          suppressHydrationWarning
        >
          {getPeriodLabel()}
        </span>
        <button
          onClick={() => navigate(1)}
          className="rounded-full p-1.5 hover:bg-muted transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Isometric garden */}
      <GardenIsometricView flowers={filteredFlowers} />

      {/* Stats */}
      <div className="flex justify-center gap-12 mt-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{filteredFlowers.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('garden.flowersGrown')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{periodHours}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('garden.hoursStudied')}</p>
        </div>
      </div>
    </div>
  );
}
