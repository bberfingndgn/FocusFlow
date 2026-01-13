"use client";

import { useState, useEffect } from 'react';
import { generateEncouragement } from '@/ai/flows/dynamic-encouragement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, MessageCircle } from 'lucide-react';

type TimerStatus = 'running' | 'paused' | 'stopped';

interface CompanionProps {
  timerStatus: TimerStatus;
  progressPercentage: number;
  userName: string;
  onClick?: () => void;
}

export function Companion({ timerStatus, progressPercentage, userName, onClick }: CompanionProps) {
  const [message, setMessage] = useState("Let's get studying!");
  const [isLoading, setIsLoading] = useState(false);
  const [characterState, setCharacterState] = useState('idle');

  useEffect(() => {
    let isMounted = true;
    
    const getEncouragement = async () => {
      setIsLoading(true);
      setCharacterState('thinking');
      try {
        const result = await generateEncouragement({
          progressPercentage: Math.round(progressPercentage),
          timerStatus,
          userName,
        });
        if (isMounted) {
          setMessage(result.encouragementMessage);
        }
      } catch (error) {
        // Silently handle error
        if (isMounted) {
          // Fallback message
          setMessage("Keep up the great work!");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setCharacterState('talking');
          setTimeout(() => setCharacterState('idle'), 3000);
        }
      }
    };
    
    getEncouragement();

    return () => {
      isMounted = false;
    }
  }, [timerStatus, progressPercentage, userName]);

  const CompanionCharacter = () => (
    <div className="relative w-24 h-24 cursor-pointer" onClick={onClick}>
      <div className={`absolute inset-0 bg-yellow-300 rounded-full transition-all duration-500 ${characterState === 'thinking' ? 'animate-pulse' : ''}`}></div>
      <div className={`absolute top-1/3 left-1/4 w-4 h-4 bg-foreground rounded-full transition-transform duration-300 ${characterState === 'talking' ? 'scale-y-50' : ''}`}></div>
      <div className={`absolute top-1/3 right-1/4 w-4 h-4 bg-foreground rounded-full transition-transform duration-300 ${characterState === 'talking' ? 'scale-y-50' : ''}`}></div>
      <div className={`absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-4 bg-foreground rounded-b-full transition-all duration-300 ${characterState === 'talking' ? 'h-6 rounded-full' : ''}`}></div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold font-headline">
          Your Companion
        </CardTitle>
        <Sparkles className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <CompanionCharacter />
        <div className="w-full min-h-[6rem] p-4 bg-muted/50 rounded-lg relative">
            <MessageCircle className="absolute top-[-10px] left-8 h-6 w-6 text-muted/50 fill-muted/50" />
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ) : (
                <p className="text-sm text-foreground/90">
                    "{message}"
                </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
