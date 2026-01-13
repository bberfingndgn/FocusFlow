
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';

type TimerStatus = 'running' | 'paused' | 'stopped';

interface StudyTimerProps {
  onSessionComplete: (durationInSeconds: number, subject: string) => void;
  onStatusChange: (status: TimerStatus) => void;
  onProgressChange: (progress: number) => void;
  subject: string;
  onSubjectChange: (subject: string) => void;
}

const DURATION_OPTIONS = [15, 25, 45, 60];
const DEFAULT_DURATION = 25;
const SUBJECT_OPTIONS = ["Mathematics", "Science", "Social Studies", "English"];

export function StudyTimer({ onSessionComplete, onStatusChange, onProgressChange, subject, onSubjectChange }: StudyTimerProps) {
  const [durationInMinutes, setDurationInMinutes] = useState(DEFAULT_DURATION);
  const sessionDurationSeconds = useMemo(() => durationInMinutes * 60, [durationInMinutes]);
  const [secondsLeft, setSecondsLeft] = useState(sessionDurationSeconds);
  const [status, setStatus] = useState<TimerStatus>('stopped');

  useEffect(() => {
    // When duration changes, reset the timer
    setSecondsLeft(sessionDurationSeconds);
    setStatus('stopped');
  }, [sessionDurationSeconds]);

  useEffect(() => {
    onStatusChange(status);
    let interval: NodeJS.Timeout | null = null;
    
    if (status === 'running' && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
            const newSecondsLeft = prev - 1;
            const progress = ((sessionDurationSeconds - newSecondsLeft) / sessionDurationSeconds) * 100;
            onProgressChange(progress);
            return newSecondsLeft;
        });
      }, 1000);
    } else if (status === 'running' && secondsLeft === 0) {
      onSessionComplete(sessionDurationSeconds, subject);
      setStatus('stopped');
      setSecondsLeft(sessionDurationSeconds);
      onProgressChange(0);
      // Optionally play a sound here
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status, secondsLeft, onStatusChange, onSessionComplete, sessionDurationSeconds, subject, onProgressChange]);

  const handleStartPause = () => {
    if (status === 'running') {
      setStatus('paused');
    } else {
      setStatus('running');
    }
  };

  const handleReset = () => {
    setStatus('stopped');
    setSecondsLeft(sessionDurationSeconds);
    onProgressChange(0);
  };
  
  const handleDurationChange = (value: string) => {
    setDurationInMinutes(Number(value));
  }
  
  const handleSubjectChange = (value: string) => {
    onSubjectChange(value);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = (secondsLeft / sessionDurationSeconds) * 100;
  const strokeDasharray = 2 * Math.PI * 90; // Circumference of the circle
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  return (
    <Card className="w-full max-w-lg shadow-lg border-2 border-primary/20">
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 gap-8">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          <svg className="absolute inset-0" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="transparent"
              stroke="hsl(var(--secondary))"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="transparent"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{
                strokeDasharray: strokeDasharray,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 1s linear'
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-bold font-headline text-foreground tabular-nums">
              {formatTime(secondsLeft)}
            </span>
             {status !== 'running' && (
              <div className="w-40 mt-4 space-y-2">
                 <Select
                  value={subject}
                  onValueChange={handleSubjectChange}
                  disabled={status === 'running' || status === 'paused'}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(durationInMinutes)}
                  onValueChange={handleDurationChange}
                  disabled={status === 'running' || status === 'paused'}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Session duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(option => (
                      <SelectItem key={option} value={String(option)}>
                        {option} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={handleReset} variant="outline" size="lg" className="rounded-full w-24">
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
          <Button onClick={handleStartPause} size="lg" className="rounded-full w-36 text-lg font-bold">
            {status === 'running' ? (
              <>
                <Pause className="h-6 w-6 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-6 w-6 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
