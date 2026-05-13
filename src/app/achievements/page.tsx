'use client';

import { AchievementCard } from '@/components/achievements/AchievementCard';
import { achievements } from '@/lib/data';
import { useLanguage } from '@/lib/i18n-context';

export default function AchievementsPage() {
  const { t } = useLanguage();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">{t('achievements.title')}</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {unlockedCount} {t('achievements.unlockedOf')} {totalCount} {t('achievements.unlockedBadges')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
