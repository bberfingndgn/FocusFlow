import { AchievementCard } from '@/components/achievements/AchievementCard';
import { achievements } from '@/lib/data';

export default function AchievementsPage() {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">Achievements</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          You've unlocked {unlockedCount} of {totalCount} badges. Keep up the great work!
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
