'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { GrownFlowerCard } from '@/components/garden/GrownFlowerCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle, Clock } from 'lucide-react';
import { useUser, useDoc, useCollection } from '@/supabase';
import { useLanguage } from '@/lib/i18n-context';
import {
  SECONDS_TO_GROW_FLOWER,
  SUBJECT_OPTIONS,
  SUBJECT_FLOWER_LOTTIE,
  SUBJECT_LABELS,
  SUBJECT_BADGE_COLORS,
} from '@/lib/constants';
import { checkIsUnder15 } from '@/lib/utils';
import type { StudySession, UserProfile, GrownFlower } from '@/lib/types';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const SUBJECT_FLOWER_TYPES: Record<string, string> = {
  'Mathematics':    'sunflower',
  'Science':        'rose',
  'Social Studies': 'tulip',
  'English':        'daisy',
};

function SubjectFlower({ subject }: { subject: string }) {
  const [animData, setAnimData] = useState<object | null>(null);
  const path = SUBJECT_FLOWER_LOTTIE[subject];

  useEffect(() => {
    if (!path) return;
    fetch(path)
      .then(r => r.json())
      .then(setAnimData)
      .catch(() => setAnimData(null));
  }, [path]);

  if (!animData) {
    return <div className="w-48 h-48 flex items-center justify-center"><LoaderCircle className="animate-spin text-primary" /></div>;
  }

  return (
    <Lottie
      animationData={animData}
      loop
      className="w-48 h-48"
    />
  );
}

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

  // Minutes per subject from real session data
  const subjectMinutes = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of effectiveSessions) {
      const subj = s.subject_id || (s as any).subjectId || 'Mathematics';
      map[subj] = (map[subj] || 0) + (s.duration || 0);
    }
    return map;
  }, [effectiveSessions]);

  // Build grown flowers from accumulated session data
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

    return flowers.reverse();
  }, [userProfile, effectiveSessions]);

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
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline text-primary">{t('garden.title')}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{t('garden.subtitle')}</p>
      </div>

      <Tabs defaultValue="Mathematics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 h-auto">
          {SUBJECT_OPTIONS.map(subject => (
            <TabsTrigger key={subject} value={subject} className="py-2 text-xs sm:text-sm">
              {SUBJECT_LABELS[subject]}
            </TabsTrigger>
          ))}
        </TabsList>

        {SUBJECT_OPTIONS.map(subject => {
          const minutes = subjectMinutes[subject] || 0;
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const timeLabel = hours > 0
            ? `${hours} sa ${mins} dk`
            : `${mins} dk`;

          const subjectFlowers = grownFlowers.filter(f => f.subject === subject);
          const badgeColor = SUBJECT_BADGE_COLORS[subject] || '';

          return (
            <TabsContent key={subject} value={subject}>
              {/* Flower + study time header */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <SubjectFlower subject={subject} />

                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${badgeColor}`}>
                  <Clock className="w-4 h-4" />
                  <span>Toplam çalışma: <strong>{timeLabel}</strong></span>
                </div>
              </div>

              {/* Grown flowers for this subject */}
              {subjectFlowers.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-2xl space-y-3">
                  <p className="text-6xl">🌱</p>
                  <p className="text-muted-foreground text-base font-medium">
                    {SUBJECT_LABELS[subject]} için henüz çiçek yok
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Bu ders için çalışma seanslarını tamamla!
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    🌸 {subjectFlowers.length} çiçek büyüdü
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {subjectFlowers.map(flower => (
                      <GrownFlowerCard key={flower.id} flower={flower} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
