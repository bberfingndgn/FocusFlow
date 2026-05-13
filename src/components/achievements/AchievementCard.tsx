'use client';

import { Card, CardContent } from '@/components/ui/card';
import { type Achievement } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lock, HelpCircle, Gift } from 'lucide-react';
import { useLanguage } from '@/lib/i18n-context';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { t } = useLanguage();
  const { id, unlocked, Icon, hidden, reward } = achievement;
  const isSecret = hidden && !unlocked;

  const title = t(`achievements.badges.${id}.title`) || achievement.title;
  const description = t(`achievements.badges.${id}.description`) || achievement.description;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md relative",
      unlocked ? 'border-primary/50 bg-card' : 'bg-muted/60',
      isSecret && 'border-dashed'
    )}>
      {reward && unlocked && (
        <div className="absolute -top-3 -right-3 bg-accent p-2 rounded-full border-2 border-background shadow-lg">
          <Gift className="w-5 h-5 text-accent-foreground" />
        </div>
      )}
      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
        <div className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center",
          unlocked ? 'bg-primary/10' : 'bg-secondary'
        )}>
          {isSecret ? (
            <HelpCircle className="w-12 h-12 text-muted-foreground" />
          ) : (
            <Icon className={cn(
              "w-12 h-12",
              unlocked ? 'text-primary' : 'text-muted-foreground'
            )} />
          )}

          {!unlocked && !isSecret && (
            <div className="absolute -bottom-1 -right-1 bg-background p-1 rounded-full border">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className={cn(
            "font-semibold font-headline text-lg",
            unlocked ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {isSecret ? t('achievements.secretTitle') : title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isSecret ? t('achievements.secretDesc') : description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
