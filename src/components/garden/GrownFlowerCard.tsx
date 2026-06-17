'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { type GrownFlower } from '@/lib/types';
import { Calendar, Book } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { SUBJECT_BADGE_COLORS } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n-context';
import type { LottieRefCurrentProps } from 'lottie-react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const SUBJECT_LOTTIE: Record<string, string> = {
  'Mathematics':    '/lottie/flower_mavi.json',
  'Science':        '/lottie/flower_mor.json',
  'Social Studies': '/lottie/flower_pembe.json',
  'English':        '/lottie/flower_sari.json',
};

interface GrownFlowerCardProps {
  flower: GrownFlower;
}

export function GrownFlowerCard({ flower }: GrownFlowerCardProps) {
  const { t } = useLanguage();
  const [lottieData, setLottieData] = useState<any>(null);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const formattedDate = flower.grownAt instanceof Date
    ? flower.grownAt.toLocaleDateString()
    : new Date(flower.grownAt).toLocaleDateString();

  const lottieSrc = SUBJECT_LOTTIE[flower.subject] ?? '/lottie/flower_sari.json';

  useEffect(() => {
    fetch(lottieSrc)
      .then(r => r.json())
      .then(setLottieData)
      .catch(() => {});
  }, [lottieSrc]);

  useEffect(() => {
    if (!lottieRef.current || !lottieData) return;
    const lastFrame = ((lottieData.op as number) || 100) - ((lottieData.ip as number) || 0) - 1;
    lottieRef.current.goToAndStop(lastFrame, true);
  }, [lottieData]);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full cursor-default">
      <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
        <div className="w-28 h-28 mb-2">
          {lottieData ? (
            <Lottie
              lottieRef={lottieRef}
              animationData={lottieData}
              autoplay={false}
              loop={false}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🌸</div>
          )}
        </div>
        <div className="text-center space-y-3 w-full">
          <Badge variant="outline" className={cn('font-medium text-base px-3 py-1', SUBJECT_BADGE_COLORS[flower.subject] ?? 'border-gray-300')}>
            <Book className="w-4 h-4 mr-1.5" />
            {flower.subject}
          </Badge>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span suppressHydrationWarning>{t('garden.grownOn')} {formattedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
