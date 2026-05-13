"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUBJECT_OPTIONS } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n-context';

type TimerStatus = 'running' | 'paused' | 'stopped';

interface StudyTimerProps {
  onSessionComplete: (durationInSeconds: number, subject: string) => void;
  onStatusChange: (status: TimerStatus) => void;
  onProgressChange: (progress: number) => void;
  subject: string;
  onSubjectChange: (subject: string) => void;
  defaultDuration?: number;
}

const DURATION_OPTIONS = [15, 25, 30, 45, 60];
const DEFAULT_DURATION = 25;

export function StudyTimer({
  onSessionComplete, onStatusChange, onProgressChange,
  subject, onSubjectChange, defaultDuration,
}: StudyTimerProps) {
  const { t } = useLanguage();
  const [durationInMinutes, setDurationInMinutes] = useState(defaultDuration ?? DEFAULT_DURATION);
  const sessionDurationSeconds = useMemo(() => durationInMinutes * 60, [durationInMinutes]);
  const [secondsLeft, setSecondsLeft] = useState(sessionDurationSeconds);
  const [status, setStatus] = useState<TimerStatus>('stopped');

  // Apply external defaultDuration when it changes (e.g. plan loaded from study-plan page)
  useEffect(() => {
    if (defaultDuration && defaultDuration !== durationInMinutes) {
      setDurationInMinutes(defaultDuration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDuration]);

  useEffect(() => {
    setSecondsLeft(sessionDurationSeconds);
    setStatus('stopped');
  }, [sessionDurationSeconds]);

  useEffect(() => {
    onStatusChange(status);
    let interval: NodeJS.Timeout | null = null;

    if (status === 'running' && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          const next = prev - 1;
          onProgressChange(((sessionDurationSeconds - next) / sessionDurationSeconds) * 100);
          return next;
        });
      }, 1000);
    } else if (status === 'running' && secondsLeft === 0) {
      onSessionComplete(sessionDurationSeconds, subject);
      setStatus('stopped');
      setSecondsLeft(sessionDurationSeconds);
      onProgressChange(0);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [status, secondsLeft, onStatusChange, onSessionComplete, sessionDurationSeconds, subject, onProgressChange]);

  const handleStartPause = () => setStatus(s => s === 'running' ? 'paused' : 'running');

  const handleReset = () => {
    setStatus('stopped');
    setSecondsLeft(sessionDurationSeconds);
    onProgressChange(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = (secondsLeft / sessionDurationSeconds) * 100;
  const strokeDasharray = 2 * Math.PI * 90;
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  return (
    <Card className="w-full max-w-sm shadow-lg border-2 border-primary/20">
      <CardContent className="flex flex-col items-center justify-center p-6 gap-6">

        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
          <svg className="absolute inset-0" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="transparent"
              stroke="hsl(var(--secondary))" strokeWidth="12" />
            <circle cx="100" cy="100" r="90" fill="transparent"
              stroke="hsl(var(--primary))" strokeWidth="12"
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{
                strokeDasharray,
                strokeDashoffset,
                transition: 'stroke-dashoffset 1s linear',
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-bold font-headline text-foreground tabular-nums">
              {formatTime(secondsLeft)}
            </span>

            {status === 'running' && subject && (
              <p className="mt-2 text-sm font-semibold text-primary/80 tracking-wide text-center px-2">
                {subject}
              </p>
            )}

            {status !== 'running' && (
              <div className="w-36 mt-3 space-y-2">
                <Select value={subject} onValueChange={onSubjectChange} disabled={status === 'paused'}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder={t('timer.subject')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(durationInMinutes)}
                  onValueChange={v => setDurationInMinutes(Number(v))}
                  disabled={status === 'paused'}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder={t('timer.duration')} />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={String(opt)}>{opt} {t('timer.min')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleReset} variant="outline" size="lg" className="rounded-full w-24">
            <RotateCcw className="h-4 w-4 mr-1.5" /> {t('timer.reset')}
          </Button>
          <Button onClick={handleStartPause} size="lg" className="rounded-full w-32 text-base font-bold">
            {status === 'running'
              ? <><Pause className="h-5 w-5 mr-2" />{t('timer.pause')}</>
              : <><Play  className="h-5 w-5 mr-2" />{t('timer.start')}</>
            }
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
