'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useDoc } from '@/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  LoaderCircle, Clock, Flame, Award, ShieldAlert,
  BookOpen, Zap, TrendingUp, Trophy,
} from 'lucide-react';
import type { StudySession, UserProfile } from '@/lib/types';
import { cn, checkIsUnder15 } from '@/lib/utils';
import { SUBJECT_OPTIONS, SUBJECT_COLORS as subjectColors, SUBJECT_EMOJIS } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n-context';
import translations from '@/lib/translations';
import { achievements } from '@/lib/data';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateDailyStreak(sessions: StudySession[]): number {
  if (!sessions || sessions.length === 0) return 0;
  const studyDates = new Set<string>();
  sessions.forEach(session => {
    const date = new Date(session.start_time || session.startTime || session.created_at || '');
    if (!isNaN(date.getTime())) studyDates.add(date.toISOString().split('T')[0]);
  });
  if (studyDates.size === 0) return 0;
  const sortedDates = Array.from(studyDates).sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === i) streak++;
    else break;
  }
  return streak;
}

function getFocusLevel(totalHours: number, t: (k: string) => string): { label: string; color: string } {
  if (totalHours < 1)  return { label: t('analysis.focusSeedling'), color: 'text-green-600' };
  if (totalHours < 5)  return { label: t('analysis.focusSprout'),   color: 'text-blue-600' };
  if (totalHours < 10) return { label: t('analysis.focusGrowing'),  color: 'text-purple-600' };
  if (totalHours < 20) return { label: t('analysis.focusBlooming'), color: 'text-pink-600' };
  return { label: t('analysis.focusMaster'), color: 'text-amber-600' };
}

// ─── Feedback message box ─────────────────────────────────────────────────────

function FeedbackBox({
  message,
  variant = 'default',
}: {
  message: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}) {
  const styles: Record<string, string> = {
    default: 'bg-primary/8 border-primary/20 text-primary dark:bg-primary/15',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-700 dark:text-green-300',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-700 dark:text-blue-300',
  };
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm leading-relaxed', styles[variant])}>
      {message}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { t, lang } = useLanguage();

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

  const pendingSessionsCount = useMemo(() => {
    if (!isUnder15 || !studySessions) return 0;
    return studySessions.filter(s => s.is_verified !== true).length;
  }, [studySessions, isUnder15]);

  const stats = useMemo(() => {
    const totalStudyTimeSeconds = userProfile?.total_study_time || 0;
    const totalStudyTimeHours = totalStudyTimeSeconds / 3600;
    const dailyStreak = calculateDailyStreak(effectiveSessions);
    const focusLevel = getFocusLevel(totalStudyTimeHours, t);
    return { totalHours: totalStudyTimeHours, dailyStreak, focusLevel };
  }, [userProfile, effectiveSessions, t]);

  // ── Subject insight ──────────────────────────────────────────────────────────
  const subjectData = useMemo(() => {
    const durations: Record<string, number> = {};
    effectiveSessions.forEach(s => {
      const subj = s.subject_id || (s as any).subjectId || 'Uncategorized';
      durations[subj] = (durations[subj] || 0) + s.duration;
    });
    return SUBJECT_OPTIONS.map(subj => ({
      subject: subj,
      emoji: SUBJECT_EMOJIS[subj] || '📚',
      minutes: durations[subj] || 0,
      color: subjectColors[subj] || '#94A3B8',
    }));
  }, [effectiveSessions]);

  const subjectInsight = useMemo(() => {
    const total = subjectData.reduce((s, d) => s + d.minutes, 0);
    if (total === 0) return { type: 'noData' as const, favorite: '', neglected: '', maxMinutes: 1 };
    const sorted = [...subjectData].sort((a, b) => b.minutes - a.minutes);
    const favorite = sorted[0];
    const studied = sorted.filter(s => s.minutes > 0);
    const notStudied = subjectData.filter(s => s.minutes === 0);
    const neglected = notStudied[0] ?? sorted[sorted.length - 1];
    const isDominant = studied.length >= 2 && favorite.minutes / total > 0.5;
    return {
      type: isDominant ? 'dominant' as const : 'balanced' as const,
      favorite: favorite.subject,
      neglected: neglected.subject,
      maxMinutes: favorite.minutes,
    };
  }, [subjectData]);

  // ── Focus insight ────────────────────────────────────────────────────────────
  const focusInsight = useMemo(() => {
    if (effectiveSessions.length === 0) return { type: 'noData' as const, avg: 0, count: 0 };
    const totalMin = effectiveSessions.reduce((s, sess) => s + sess.duration, 0);
    const avg = Math.round(totalMin / effectiveSessions.length);
    return {
      type: avg > 35 ? 'high' as const : avg >= 20 ? 'normal' as const : 'low' as const,
      avg,
      count: effectiveSessions.length,
    };
  }, [effectiveSessions]);

  // ── Weekly insight ───────────────────────────────────────────────────────────
  const weeklyInsight = useMemo(() => {
    const daySlots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const minutes = new Array(7).fill(0) as number[];
    effectiveSessions.forEach(s => {
      const date = new Date(s.start_time || (s as any).startTime || s.created_at || '');
      if (isNaN(date.getTime())) return;
      date.setHours(0, 0, 0, 0);
      const idx = daySlots.findIndex(d => d.getTime() === date.getTime());
      if (idx >= 0) minutes[idx] += s.duration;
    });
    const total7 = minutes.reduce((a, b) => a + b, 0);
    const last3 = minutes.slice(4);
    let trendType: 'inactive' | 'declining' | 'improving' | 'steady';
    if (total7 === 0) trendType = 'inactive';
    else if (last3[0] > last3[1] && last3[1] >= last3[2]) trendType = 'declining';
    else if (last3[2] > last3[1] && last3[1] >= last3[0]) trendType = 'improving';
    else trendType = 'steady';
    return { minutes, daySlots, trendType, maxMinutes: Math.max(...minutes, 1) };
  }, [effectiveSessions]);

  // ── Achievement insight ──────────────────────────────────────────────────────
  const achievementInsight = useMemo(() => {
    const totalHours = stats.totalHours;
    const upcoming = achievements
      .filter(a => !a.hidden && totalHours < a.milestoneHours)
      .sort((a, b) => a.milestoneHours - b.milestoneHours);
    if (upcoming.length === 0) return { type: 'allUnlocked' as const };
    const next = upcoming[0];
    const hoursLeft = Math.max(0, next.milestoneHours - totalHours);
    const progress = Math.min(100, (totalHours / next.milestoneHours) * 100);
    return { type: 'next' as const, achievement: next, hoursLeft, progress };
  }, [stats.totalHours]);

  // Typed shorthand for the new analysis translation keys
  const ana = translations[lang].analysis as any;

  const isLoading = isUserLoading || isProfileLoading || (user && isSessionsLoading);
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">{t('analysis.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('analysis.subtitle')}</p>
      </div>

      {/* Pending sessions warning */}
      {isUnder15 && pendingSessionsCount > 0 && (
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 text-amber-700 dark:text-amber-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{
              __html: translations[lang].analysis.pendingWarning(pendingSessionsCount),
            }}
          />
        </div>
      )}

      {/* ── Top 3 stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('analysis.totalStudyTime')}</p>
                <p className="text-3xl font-bold text-foreground">
                  {Math.floor(stats.totalHours)}<span className="text-xl text-muted-foreground">h</span>{' '}
                  {Math.round((stats.totalHours % 1) * 60)}<span className="text-xl text-muted-foreground">m</span>
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('analysis.dailyStreak')}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.dailyStreak}{' '}
                  <span className="text-xl text-muted-foreground">{t('analysis.days')}</span>
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <Flame className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('analysis.focusLevel')}</p>
                <p className={cn('text-3xl font-bold', stats.focusLevel.color)}>
                  {stats.focusLevel.label}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Insights section ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-headline">{ana.insightsTitle}</h2>
        <p className="text-sm text-muted-foreground mt-1">{ana.insightsDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Subject Distribution ── */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-primary" />
              {ana.subjectCardTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {subjectData.map(item => {
                const barWidth =
                  subjectInsight.maxMinutes > 0
                    ? Math.round((item.minutes / subjectInsight.maxMinutes) * 100)
                    : 0;
                const isFav = subjectInsight.type !== 'noData' && item.subject === subjectInsight.favorite;
                const isNeglected = subjectInsight.type === 'dominant' && item.subject === subjectInsight.neglected;
                return (
                  <div key={item.subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span>{item.emoji}</span>
                        <span className="font-medium truncate">{item.subject}</span>
                        {isFav && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {ana.subjectFavLabel}
                          </span>
                        )}
                        {isNeglected && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            {ana.subjectNeglectLabel}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
                        {item.minutes} {ana.minLabel}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <FeedbackBox
              message={
                subjectInsight.type === 'noData'
                  ? ana.subjectNoDataMsg
                  : subjectInsight.type === 'dominant'
                  ? ana.subjectDominantMsg(subjectInsight.favorite, subjectInsight.neglected)
                  : ana.subjectBalancedMsg
              }
              variant={
                subjectInsight.type === 'dominant'
                  ? 'warning'
                  : subjectInsight.type === 'balanced'
                  ? 'success'
                  : 'default'
              }
            />
          </CardContent>
        </Card>

        {/* ── Focus Quality ── */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-primary" />
              {ana.focusCardTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {focusInsight.type !== 'noData' ? (
              <div className="flex items-center justify-around py-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary tabular-nums">{focusInsight.avg}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{ana.avgSessionLabel}</p>
                  <p className="text-xs text-muted-foreground">{ana.minLabel}</p>
                </div>
                <div className="w-px h-16 bg-border" />
                <div className="text-center">
                  <p className="text-5xl font-bold text-foreground tabular-nums">{focusInsight.count}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{ana.totalSessionsLabel}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-4xl text-muted-foreground">—</div>
            )}
            <FeedbackBox
              message={
                focusInsight.type === 'noData'
                  ? ana.focusNoDataMsg
                  : focusInsight.type === 'high'
                  ? ana.focusHighMsg(focusInsight.avg)
                  : focusInsight.type === 'normal'
                  ? ana.focusNormalMsg(focusInsight.avg)
                  : ana.focusLowMsg
              }
              variant={
                focusInsight.type === 'high'
                  ? 'success'
                  : focusInsight.type === 'normal'
                  ? 'info'
                  : focusInsight.type === 'low'
                  ? 'warning'
                  : 'default'
              }
            />
          </CardContent>
        </Card>

        {/* ── Weekly Activity ── */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              {ana.weeklyCardTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 7-day mini bar chart */}
            <div className="flex items-end gap-1.5 pt-2" style={{ height: '80px' }}>
              {weeklyInsight.minutes.map((min, i) => {
                const barH = Math.max(
                  (min / weeklyInsight.maxMinutes) * 52,
                  min > 0 ? 6 : 3,
                );
                const dayName = ana.weekDayShort[weeklyInsight.daySlots[i].getDay()];
                const isToday = i === 6;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all duration-500',
                        isToday ? 'bg-primary' : 'bg-primary/35',
                        min === 0 && 'opacity-30',
                      )}
                      style={{ height: `${barH}px` }}
                      title={`${min} ${ana.minLabel}`}
                    />
                    <span
                      className={cn(
                        'text-[9px] font-medium leading-none',
                        isToday ? 'text-primary font-bold' : 'text-muted-foreground',
                      )}
                    >
                      {dayName}
                    </span>
                  </div>
                );
              })}
            </div>
            <FeedbackBox
              message={
                weeklyInsight.trendType === 'declining'
                  ? ana.trendDecliningMsg
                  : weeklyInsight.trendType === 'improving'
                  ? ana.trendImprovingMsg
                  : weeklyInsight.trendType === 'inactive'
                  ? ana.trendInactiveMsg
                  : ana.trendSteadyMsg
              }
              variant={
                weeklyInsight.trendType === 'improving'
                  ? 'success'
                  : weeklyInsight.trendType === 'declining' || weeklyInsight.trendType === 'inactive'
                  ? 'warning'
                  : 'info'
              }
            />
          </CardContent>
        </Card>

        {/* ── Next Achievement ── */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-primary" />
              {ana.achievementCardTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievementInsight.type === 'next' ? (
              <>
                <div className="flex items-center gap-4 py-2">
                  <div className="p-3 bg-accent/50 rounded-full shrink-0">
                    <achievementInsight.achievement.Icon className="w-9 h-9 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base leading-tight">
                      {t(`achievements.badges.${achievementInsight.achievement.id}.title`) ||
                        achievementInsight.achievement.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {t(`achievements.badges.${achievementInsight.achievement.id}.description`) ||
                        achievementInsight.achievement.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{ana.progressLabel}</span>
                    <span>{achievementInsight.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={achievementInsight.progress} className="h-2.5" />
                </div>
                <FeedbackBox
                  message={ana.nearAchievementMsg(
                    t(`achievements.badges.${achievementInsight.achievement.id}.title`) ||
                      achievementInsight.achievement.title,
                    achievementInsight.hoursLeft,
                  )}
                  variant="info"
                />
              </>
            ) : (
              <div className="py-4">
                <FeedbackBox message={ana.allBadgesMsg} variant="success" />
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
