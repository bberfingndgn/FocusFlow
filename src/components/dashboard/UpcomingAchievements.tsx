"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { achievements } from "@/lib/data";
import { CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "../ui/button";
import { useLanguage } from "@/lib/i18n-context";

interface UpcomingAchievementsProps {
    currentStudyTime: number; // in seconds
}

export function UpcomingAchievements({ currentStudyTime }: UpcomingAchievementsProps) {
    const { t } = useLanguage();
    const nextAchievements = achievements
        .filter(a => !a.unlocked)
        .sort((a, b) => a.milestoneHours - b.milestoneHours)
        .slice(0, 3);

    const currentHours = currentStudyTime / 3600;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">
                    {t('achievements.nextTitle')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {nextAchievements.length > 0 ? (
                    nextAchievements.map(achievement => {
                        const progress = Math.min(100, (currentHours / achievement.milestoneHours) * 100);
                        const title = t(`achievements.badges.${achievement.id}.title`) || achievement.title;
                        const description = t(`achievements.badges.${achievement.id}.description`) || achievement.description;
                        return (
                            <div key={achievement.id} className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/50 rounded-full">
                                        <achievement.Icon className="w-5 h-5 text-accent-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{title}</p>
                                        <p className="text-xs text-muted-foreground">{description}</p>
                                    </div>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-muted-foreground space-y-2">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                        <p>{t('achievements.allUnlocked')}</p>
                    </div>
                )}
                <Button asChild variant="outline" className="w-full">
                    <Link href="/achievements">
                        {t('achievements.viewAll')}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
