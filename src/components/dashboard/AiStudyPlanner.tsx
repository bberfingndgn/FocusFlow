'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SUBJECT_OPTIONS, SUBJECT_EMOJIS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n-context';
import {
  BookOpen, Coffee, FileText, Target, Zap, Play,
  Clock, ListChecks, ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionType = 'study' | 'break' | 'practice' | 'exam';
type IntensityLevel = 'light' | 'normal' | 'hard';

interface PlanSession {
  type: SessionType;
  durationMinutes: number;
  labelKey: string;
}

interface StudyTemplate {
  id: IntensityLevel;
  emoji: string;
  multiplier: number;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  sessions: PlanSession[];
}

interface AiStudyPlannerProps { userName: string; isUnder15: boolean }

// ─── Session visual config ────────────────────────────────────────────────────

const SESSION_CONFIG: Record<SessionType, {
  icon: React.ReactNode;
  bg: string;
  text: string;
  border: string;
  bar: string;
}> = {
  study: {
    icon: <BookOpen className="w-4 h-4" />,
    bg:   'bg-primary/8 dark:bg-primary/15',
    text: 'text-primary',
    border: 'border-primary/30',
    bar:  'bg-primary',
  },
  break: {
    icon: <Coffee className="w-4 h-4" />,
    bg:   'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-700',
    bar:  'bg-amber-400',
  },
  practice: {
    icon: <FileText className="w-4 h-4" />,
    bg:   'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-700',
    bar:  'bg-blue-400',
  },
  exam: {
    icon: <Target className="w-4 h-4" />,
    bg:   'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-700',
    bar:  'bg-red-400',
  },
};

// ─── Templates (labels resolved via t() at render) ───────────────────────────

const TEMPLATES: StudyTemplate[] = [
  {
    id: 'light',
    emoji: '☀️',
    multiplier: 1.0,
    accentBg:     'bg-green-50 dark:bg-green-950/30',
    accentText:   'text-green-700 dark:text-green-300',
    accentBorder: 'border-green-300 dark:border-green-700',
    sessions: [
      { type: 'study', durationMinutes: 25, labelKey: 'readyPlanner.sessions.study' },
      { type: 'break', durationMinutes: 10, labelKey: 'readyPlanner.sessions.break' },
    ],
  },
  {
    id: 'normal',
    emoji: '⚡',
    multiplier: 1.2,
    accentBg:     'bg-blue-50 dark:bg-blue-950/30',
    accentText:   'text-blue-700 dark:text-blue-300',
    accentBorder: 'border-blue-300 dark:border-blue-700',
    sessions: [
      { type: 'study',    durationMinutes: 25, labelKey: 'readyPlanner.sessions.study' },
      { type: 'break',    durationMinutes:  5, labelKey: 'readyPlanner.sessions.shortBreak' },
      { type: 'study',    durationMinutes: 25, labelKey: 'readyPlanner.sessions.study' },
      { type: 'practice', durationMinutes: 15, labelKey: 'readyPlanner.sessions.practice' },
    ],
  },
  {
    id: 'hard',
    emoji: '🔥',
    multiplier: 1.5,
    accentBg:     'bg-red-50 dark:bg-red-950/30',
    accentText:   'text-red-700 dark:text-red-300',
    accentBorder: 'border-red-300 dark:border-red-700',
    sessions: [
      { type: 'study', durationMinutes: 30, labelKey: 'readyPlanner.sessions.intenseStudy' },
      { type: 'break', durationMinutes:  5, labelKey: 'readyPlanner.sessions.focusBreak' },
      { type: 'study', durationMinutes: 30, labelKey: 'readyPlanner.sessions.intenseStudy' },
      { type: 'break', durationMinutes:  5, labelKey: 'readyPlanner.sessions.focusBreak' },
      { type: 'study', durationMinutes: 30, labelKey: 'readyPlanner.sessions.intenseStudy' },
      { type: 'exam',  durationMinutes: 10, labelKey: 'readyPlanner.sessions.finalExam' },
    ],
  },
];

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({
  template, t,
}: {
  template: StudyTemplate;
  t: (k: string) => string;
}) {
  const totalMinutes = template.sessions.reduce((s, sess) => s + sess.durationMinutes, 0);
  const maxDuration  = Math.max(...template.sessions.map(s => s.durationMinutes));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground uppercase tracking-wide">
            {t('readyPlanner.timelineTitle')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {t('readyPlanner.timelineTotal')}{' '}
            <strong className="text-foreground">{totalMinutes} dk</strong>
          </span>
        </div>
      </div>

      {/* Session cards */}
      <div className="relative pl-9">
        <div className="absolute left-3.5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent rounded-full" />

        <div className="space-y-2.5">
          {template.sessions.map((sess, idx) => {
            const cfg = SESSION_CONFIG[sess.type];
            const barWidth = Math.round((sess.durationMinutes / maxDuration) * 100);
            return (
              <div key={idx} className="relative flex items-center gap-3">
                <div className={cn(
                  'absolute -left-9 w-7 h-7 rounded-full border-2 border-background',
                  'flex items-center justify-center z-10 shadow-sm',
                  cfg.bg, cfg.text,
                )}>
                  {cfg.icon}
                </div>

                <div className={cn(
                  'flex-1 rounded-xl border px-4 py-3 transition-all hover:shadow-sm',
                  cfg.bg, cfg.border,
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('font-semibold text-sm', cfg.text)}>
                      {t(sess.labelKey)}
                    </span>
                    <span className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      cfg.bg, cfg.text,
                    )}>
                      {sess.durationMinutes} dk
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', cfg.bar)}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Finish marker */}
          <div className="relative flex items-center gap-3">
            <div className="absolute -left-9 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70
                            text-primary-foreground flex items-center justify-center z-10 shadow-md text-base">
              🌸
            </div>
            <span className="text-sm font-semibold text-primary">
              {t('readyPlanner.timelineDone')}
            </span>
          </div>
        </div>
      </div>

      {/* Multiplier badge */}
      <div className={cn(
        'flex items-center gap-2 rounded-xl border px-4 py-2.5',
        template.accentBg, template.accentBorder,
      )}>
        <Zap className={cn('w-4 h-4 shrink-0', template.accentText)} />
        <div>
          <span className={cn('text-xs font-bold', template.accentText)}>
            {t('readyPlanner.multiplierLabel')} {template.multiplier}x
          </span>
          <p className="text-xs text-muted-foreground leading-none mt-0.5">
            {template.multiplier === 1.0
              ? t('readyPlanner.multiplierNormal')
              : t('readyPlanner.multiplierBoost')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AiStudyPlanner({ isUnder15 }: AiStudyPlannerProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [subject, setSubject] = useState('');
  const [intensity, setIntensity] = useState<IntensityLevel>('normal');

  const template = TEMPLATES.find(tmpl => tmpl.id === intensity)!;
  const firstStudy = template.sessions.find(s => s.type === 'study');
  const subjectEmoji = subject ? (SUBJECT_EMOJIS[subject] ?? '📚') : null;

  const handleStart = () => {
    if (!subject) return;
    localStorage.setItem('focusflow-active-plan', JSON.stringify({
      subject,
      duration: firstStudy?.durationMinutes ?? 25,
      multiplier: template.multiplier,
      intensity: template.id,
    }));
    router.push('/');
  };

  return (
    <Card className="border-2 shadow-sm w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ListChecks className="h-5 w-5 text-primary" />
          {isUnder15 ? t('readyPlanner.cardTitleKid') : t('readyPlanner.cardTitle')}
        </CardTitle>
        <CardDescription>
          {isUnder15 ? t('readyPlanner.cardDescKid') : t('readyPlanner.cardDesc')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* ── Step 1: Subject ── */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary" />
            {t('readyPlanner.step1')}
          </Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('readyPlanner.subjectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map(s => (
                <SelectItem key={s} value={s}>
                  <span className="flex items-center gap-2">
                    <span>{SUBJECT_EMOJIS[s]}</span>
                    <span>{s}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Step 2: Intensity ── */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-primary" />
            {t('readyPlanner.step2')}
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map(tmpl => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setIntensity(tmpl.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all',
                  intensity === tmpl.id
                    ? `${tmpl.accentBg} ${tmpl.accentBorder} shadow-sm`
                    : 'border-border bg-background hover:border-primary/30'
                )}
              >
                <span className="text-2xl">{tmpl.emoji}</span>
                <span className={cn(
                  'text-xs font-bold',
                  intensity === tmpl.id ? tmpl.accentText : 'text-foreground',
                )}>
                  {t(`readyPlanner.templates.${tmpl.id}.label`)}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight text-center">
                  {t(`readyPlanner.templates.${tmpl.id}.tagline`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Step 3: Timeline ── */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" />
            {t('readyPlanner.step3')}
          </Label>
          <div className="rounded-2xl border bg-muted/20 p-4">
            <Timeline template={template} t={t} />
          </div>
        </div>

        {/* ── Start Button ── */}
        <Button
          onClick={handleStart}
          disabled={!subject}
          size="lg"
          className="w-full text-base font-bold gap-2"
        >
          {subject ? (
            <>
              {subjectEmoji} {subject} · {template.emoji} {t(`readyPlanner.templates.${intensity}.label`)}
              <ChevronRight className="w-5 h-5 ml-auto" />
              <Play className="w-5 h-5" />
              {t('readyPlanner.startButton')}
            </>
          ) : (
            t('readyPlanner.selectFirst')
          )}
        </Button>

      </CardContent>
    </Card>
  );
}
