'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LottieRefCurrentProps } from 'lottie-react';
import type { GrownFlower } from '@/lib/types';
import { useLanguage } from '@/lib/i18n-context';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const SUBJECT_LOTTIE: Record<string, string> = {
  'Mathematics':    '/lottie/flower_mavi.json',
  'Science':        '/lottie/flower_mor.json',
  'Social Studies': '/lottie/flower_pembe.json',
  'English':        '/lottie/flower_sari.json',
};

function FlowerSlot({ flower }: { flower: GrownFlower }) {
  const [lottieData, setLottieData] = useState<object | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const src = SUBJECT_LOTTIE[flower.subject] ?? '/lottie/flower_sari.json';

  useEffect(() => {
    fetch(src).then(r => r.json()).then(setLottieData).catch(() => {});
  }, [src]);

  useEffect(() => {
    if (!lottieRef.current || !lottieData) return;
    const data = lottieData as { op?: number; ip?: number };
    const lastFrame = (data.op ?? 100) - (data.ip ?? 0) - 1;
    lottieRef.current.goToAndStop(lastFrame, true);
  }, [lottieData]);

  return (
    <div className="flex items-end justify-center rounded-xl bg-white/10 p-1 aspect-square">
      {lottieData ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={lottieData}
          autoplay={false}
          loop={false}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <span className="text-2xl">🌸</span>
      )}
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="flex items-center justify-center rounded-xl bg-black/10 aspect-square">
      <span className="text-lg opacity-30">🌱</span>
    </div>
  );
}

interface GardenIsometricViewProps {
  flowers: GrownFlower[];
}

export default function GardenIsometricView({ flowers }: GardenIsometricViewProps) {
  const { t } = useLanguage();

  const totalSlots = Math.max(Math.ceil((flowers.length + 5) / 5) * 5, 10);
  const slots: (GrownFlower | null)[] = [
    ...flowers,
    ...Array(totalSlots - flowers.length).fill(null),
  ];

  return (
    <div className="mx-auto w-full max-w-sm sm:max-w-md">
      {/* 3D platform */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(145deg, #5cb85c 0%, #3d8b3d 60%, #2d6b2d 100%)',
          backgroundImage: `
            repeating-linear-gradient(-30deg, transparent 0px, transparent 44px, rgba(0,0,0,.06) 44px, rgba(0,0,0,.06) 45px),
            repeating-linear-gradient( 30deg, transparent 0px, transparent 44px, rgba(0,0,0,.06) 44px, rgba(0,0,0,.06) 45px)
          `,
          boxShadow: '0 6px 0 #2d6b2d, 0 10px 0 #1e4d1e, 0 14px 32px rgba(0,0,0,.35)',
        }}
      >
        {flowers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <span className="text-5xl">🪧</span>
            <p className="text-white/80 font-medium text-sm text-center">
              {t('garden.emptyPeriod')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {slots.map((flower, i) =>
              flower ? (
                <FlowerSlot key={flower.id} flower={flower} />
              ) : (
                <EmptySlot key={`empty-${i}`} />
              )
            )}
          </div>
        )}
      </div>

      {/* Platform bottom edge */}
      <div
        className="mx-3 h-3 rounded-b-xl"
        style={{ background: '#1e4d1e' }}
      />
    </div>
  );
}
