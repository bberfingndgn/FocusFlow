'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GrownFlowerCard } from '@/components/garden/GrownFlowerCard';
import { LoaderCircle } from 'lucide-react';
import { useUser, useDoc, useCollection } from '@/supabase';
import { useLanguage } from '@/lib/i18n-context';
import { SECONDS_TO_GROW_FLOWER } from '@/lib/constants';
import { checkIsUnder15 } from '@/lib/utils';
import type { StudySession, UserProfile, GrownFlower } from '@/lib/types';

const SUBJECT_FLOWER_TYPES: Record<string, string> = {
  'Mathematics':    'sunflower',
  'Science':        'rose',
  'Social Studies': 'tulip',
  'English':        'daisy',
};

export default function GardenPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { t } = useLanguage();

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

  // Build flowers from real accumulated session data
  const grownFlowers = useMemo((): GrownFlower[] => {
    if (!userProfile) return [];

    const totalStudyTime = userProfile.total_study_time || 0;
    const totalFlowers = Math.floor(totalStudyTime / SECONDS_TO_GROW_FLOWER);
    if (totalFlowers === 0) return [];

    // Sort sessions oldest → newest
    const sorted = [...effectiveSessions].sort(
      (a, b) =>
        new Date(a.start_time || a.created_at || '').getTime() -
        new Date(b.start_time || b.created_at || '').getTime()
    );

    // Walk sessions in order, mark each 4-hour crossing as a flower
    const flowers: GrownFlower[] = [];
    let accumulatedSeconds = 0;
    let flowerIndex = 0;

    for (const session of sorted) {
      if (flowerIndex >= totalFlowers) break;

      let remaining = session.duration * 60; // session duration in seconds

      while (remaining > 0 && flowerIndex < totalFlowers) {
        const nextThreshold = (flowerIndex + 1) * SECONDS_TO_GROW_FLOWER;
        const toNext = nextThreshold - accumulatedSeconds;

        if (remaining >= toNext) {
          // This session crosses the next flower threshold
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

    // If multiplier inflated total_study_time beyond raw session time, pad with last subject
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

    return flowers.reverse(); // newest first
  }, [userProfile, effectiveSessions]);

  const isLoading = isUserLoading || isProfileLoading || (user && isSessionsLoading);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline text-primary">{t('garden.title')}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{t('garden.subtitle')}</p>
      </div>

      {grownFlowers.length === 0 ? (
        <div className="text-center py-16 bg-muted/50 rounded-2xl space-y-3">
          <p className="text-7xl">🌱</p>
          <p className="text-muted-foreground text-lg font-medium">{t('garden.empty')}</p>
          <p className="text-sm text-muted-foreground/70">{t('garden.emptyHint')}</p>
        </div>
      ) : (
        <>
          <p className="text-center text-sm text-muted-foreground mb-6">
            🌸 {grownFlowers.length} {grownFlowers.length === 1 ? 'flower' : 'flowers'} grown
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {grownFlowers.map((flower) => (
              <GrownFlowerCard key={flower.id} flower={flower} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
