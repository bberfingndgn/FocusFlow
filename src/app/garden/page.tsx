'use client';

import { GrownFlowerCard } from '@/components/garden/GrownFlowerCard';
import { grownFlowers } from '@/lib/data';
import { LoaderCircle } from 'lucide-react';
import { useUser } from '@/supabase';
import { useLanguage } from '@/lib/i18n-context';

export default function GardenPage() {
  const { isUserLoading } = useUser();
  const { t } = useLanguage();

  if (isUserLoading) {
    return <div className="flex-1 flex items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const validFlowers = grownFlowers.filter(f => f?.subject);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline text-primary">{t('garden.title')}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{t('garden.subtitle')}</p>
      </div>

      {validFlowers.length === 0 ? (
        <div className="text-center py-16 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">{t('garden.empty')}</p>
          <p className="text-sm text-muted-foreground/80">{t('garden.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {validFlowers.map((flower) => (
            <GrownFlowerCard key={flower.id} flower={flower} />
          ))}
        </div>
      )}
    </div>
  );
}
