'use client';

import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react';

export type TimerStatus = 'running' | 'paused' | 'stopped';

export interface SessionCompleted {
  durationSeconds: number;
  subject: string;
}

interface TimerContextValue {
  secondsLeft: number;
  status: TimerStatus;
  subject: string;
  durationInMinutes: number;
  sessionProgress: number;
  sessionCompleted: SessionCompleted | null;
  toggleStartPause: () => void;
  reset: () => void;
  setSubject: (s: string) => void;
  setDuration: (minutes: number) => void;
  clearSessionCompleted: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TimerStatus>('stopped');
  const [subject, setSubjectState] = useState('Mathematics');
  const [durationInMinutes, setDurationState] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [sessionCompleted, setSessionCompleted] = useState<SessionCompleted | null>(null);

  const sessionDurationSeconds = durationInMinutes * 60;

  // Interval lives here — persists across page navigation
  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Complete session when countdown reaches 0
  useEffect(() => {
    if (status === 'running' && secondsLeft === 0) {
      setSessionCompleted({ durationSeconds: sessionDurationSeconds, subject });
      setStatus('stopped');
      setSecondsLeft(sessionDurationSeconds);
    }
  }, [secondsLeft, status, sessionDurationSeconds, subject]);

  const toggleStartPause = useCallback(
    () => setStatus(s => (s === 'running' ? 'paused' : 'running')),
    []
  );

  const reset = useCallback(() => {
    setStatus('stopped');
    setSecondsLeft(sessionDurationSeconds);
  }, [sessionDurationSeconds]);

  const setSubject = useCallback((s: string) => setSubjectState(s), []);

  const setDuration = useCallback((minutes: number) => {
    setDurationState(minutes);
    setSecondsLeft(minutes * 60);
    setStatus('stopped');
  }, []);

  const clearSessionCompleted = useCallback(() => setSessionCompleted(null), []);

  const sessionProgress =
    sessionDurationSeconds > 0
      ? ((sessionDurationSeconds - secondsLeft) / sessionDurationSeconds) * 100
      : 0;

  return (
    <TimerContext.Provider
      value={{
        secondsLeft,
        status,
        subject,
        durationInMinutes,
        sessionProgress,
        sessionCompleted,
        toggleStartPause,
        reset,
        setSubject,
        setDuration,
        clearSessionCompleted,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimerContext must be used within TimerProvider');
  return ctx;
}
