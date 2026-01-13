
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Companion } from '@/components/dashboard/Companion';
import { Flower } from '@/components/dashboard/Flower';
import { StudyTimer } from '@/components/dashboard/StudyTimer';
import { UpcomingAchievements } from '@/components/dashboard/UpcomingAchievements';
import { SECONDS_TO_GROW_FLOWER, USER_NAME } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { achievements } from '@/lib/data';
import { useUser, useDoc, useCollection, supabase } from '@/supabase';
import { useRouter } from 'next/navigation';
import type { StudySession, UserProfile } from '@/lib/types';
import { LoaderCircle, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

type TimerStatus = 'running' | 'paused' | 'stopped';

const SUBJECT_OPTIONS = ["Mathematics", "Science", "Social Studies", "English"];

const subjectEmojis: Record<string, string> = {
  "Mathematics": "➕",
  "Science": "🧪",
  "Social Studies": "🌍",
  "English": "📖",
};


export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // Supabase: useDoc for user profile
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(
    'users',
    user?.id || null,
    !!user
  );

  // Supabase: useCollection for study sessions
  const { data: studySessions, isLoading: isSessionsLoading, error: sessionsError } = useCollection<StudySession>(
    'study_sessions',
    user ? [{ column: 'user_id', value: user.id }] : undefined,
    !!user
  );

  // Silently handle errors - don't show toasts for data fetching errors
  useEffect(() => {
    // Errors are handled silently - no toast notifications
  }, [profileError, sessionsError]);

  const [timerStatus, setTimerStatus] = useState<TimerStatus>('stopped');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const { toast } = useToast();
  
  const [sessionProgress, setSessionProgress] = useState(0);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const totalStudyTime = userProfile?.total_study_time ?? 0;
  
  // Calculate study time per subject
  const subjectStudyTimes = useMemo(() => {
    if (!studySessions) return {};

    const times: Record<string, { hours: number; minutes: number }> = {};
    SUBJECT_OPTIONS.forEach(subject => {
      const totalDurationInMinutes = studySessions
        .filter(session => {
          // Match subject exactly or handle potential variations
          const sessionSubject = session.subject_id?.trim() || '';
          return sessionSubject === subject;
        })
        .reduce((acc, session) => acc + (session.duration || 0), 0);
      
      const hours = Math.floor(totalDurationInMinutes / 60);
      const minutes = Math.round(totalDurationInMinutes % 60);
      times[subject] = { hours, minutes };
    });

    return times;
  }, [studySessions]);

  const unlockAchievement = useCallback((achievementId: string) => {
     const achievement = achievements.find(a => a.id === achievementId);
     if (achievement && !achievement.unlocked) {
       achievement.unlocked = true; // Mutating for session state, won't persist across reloads
       toast({
         title: "Achievement Unlocked! 🏆",
         description: `You've earned the "${achievement.title}" badge!`,
       });
     }
  }, [toast]);


  const handleSessionComplete = useCallback(async (sessionDuration: number, subject: string) => {
    if (!user) return;

    const newTotalStudyTime = totalStudyTime + sessionDuration;
    
    const now = new Date();
    const startTime = new Date(now.getTime() - sessionDuration * 1000);

    // Supabase: Insert study session
    const { error: sessionError } = await supabase.from('study_sessions').insert({
      user_id: user.id,
      subject_id: subject,
      start_time: startTime.toISOString(),
      end_time: now.toISOString(),
      duration: Math.round(sessionDuration / 60), // duration in minutes
    });

    if (sessionError) {
      // Silently handle error - don't show toast unless critical
      return;
    }
    
    // Supabase: Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({ total_study_time: newTotalStudyTime })
      .eq('id', user.id);

    // Silently handle update errors
    if (updateError) {
      // Error handled silently
    }
    
    const oldFlowers = Math.floor(totalStudyTime / SECONDS_TO_GROW_FLOWER);
    const newFlowers = Math.floor(newTotalStudyTime / SECONDS_TO_GROW_FLOWER);

    if (newFlowers > oldFlowers) {
      toast({
        title: "New Flower Grown! 🌸",
        description: "You've completed a full growth cycle. Check your garden!",
      });
    }
    
    achievements.forEach(achievement => {
      if (!achievement.unlocked && newTotalStudyTime >= (achievement.milestoneHours * 3600)) {
        unlockAchievement(achievement.id);
      }
    });

    unlockAchievement('perfect-timing');

    setSessionProgress(0); // Reset progress on complete

  }, [totalStudyTime, user, toast, unlockAchievement]);

  const handleStatusChange = (status: TimerStatus) => {
    setTimerStatus(status);
     if (status === 'stopped' || status === 'paused') {
      setSessionProgress(0); // Reset progress if stopped or paused
    }
  };
  
  const handleProgressChange = (progress: number) => {
    setSessionProgress(progress);
  };

  const handleCompanionClick = useCallback(async () => {
    if (!user || !userProfile) return;
    
    const newClickCount = (userProfile.companion_clicks || 0) + 1;
    
    const { error } = await supabase
      .from('users')
      .update({ companion_clicks: newClickCount })
      .eq('id', user.id);

    if (error) {
      // Silently handle error
      return;
    }

    if (newClickCount >= 10) {
        unlockAchievement('companion-friend');
    }
  }, [user, userProfile, unlockAchievement]);


  if (isUserLoading || isProfileLoading || isSessionsLoading) {
      return (
          <div className="flex-1 flex items-center justify-center">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }
  
  if (!user) {
      return null;
  }

  const flowerProgress = timerStatus === 'running' || timerStatus === 'paused' 
    ? sessionProgress 
    : (totalStudyTime % SECONDS_TO_GROW_FLOWER) / SECONDS_TO_GROW_FLOWER * 100;

  return (
    <div className="flex-1 container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        
        <div className="w-full order-2 lg:order-1">
          <Companion
            timerStatus={timerStatus}
            progressPercentage={flowerProgress}
            userName={user.user_metadata?.username || user.email || USER_NAME}
            onClick={handleCompanionClick}
          />
        </div>

        <div className="lg:col-span-1 flex flex-col items-center justify-center gap-6 order-1 lg:order-2">
          <StudyTimer 
            onSessionComplete={handleSessionComplete}
            onStatusChange={handleStatusChange}
            onProgressChange={handleProgressChange}
            subject={selectedSubject}
            onSubjectChange={setSelectedSubject}
          />
          <Flower progress={flowerProgress} subject={selectedSubject} />
        </div>
        
        <div className="w-full order-3 lg:order-3">
          <UpcomingAchievements currentStudyTime={totalStudyTime} />
        </div>

      </div>

       <div className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-headline text-primary">My Garden</h2>
            <p className="text-muted-foreground mt-2">Track your study progress by subject.</p>
          </div>
          
          <Tabs defaultValue={SUBJECT_OPTIONS[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 h-auto">
              {SUBJECT_OPTIONS.map((subject) => (
                <TabsTrigger 
                  key={subject} 
                  value={subject} 
                  className="text-xs sm:text-sm py-2 px-2 sm:px-3 transition-all duration-200"
                >
                  <span className="mr-1">{subjectEmojis[subject]}</span>
                  <span className="hidden sm:inline">{subject}</span>
                  <span className="sm:hidden">{subject.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {SUBJECT_OPTIONS.map((subject) => {
              const studyTime = subjectStudyTimes[subject] || { hours: 0, minutes: 0 };
              return (
                <TabsContent 
                  key={subject} 
                  value={subject} 
                  className="mt-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95 duration-200"
                >
                  <Card className="border-2 shadow-sm transition-all duration-200">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-col items-center justify-center gap-6">
                        <div className="text-6xl mb-2">
                          {subjectEmojis[subject]}
                        </div>
                        <h3 className="text-2xl font-bold font-headline text-primary">
                          {subject}
                        </h3>
                        <div className="w-full max-w-md mt-4">
                          <div className="bg-muted/50 rounded-lg p-6 border">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <Clock className="w-6 h-6 text-primary" />
                              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Time Studied
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-4xl font-bold text-foreground">
                                {studyTime.hours}
                              </span>
                              <span className="text-2xl text-muted-foreground ml-2">hours</span>
                              <span className="text-4xl font-bold text-foreground ml-4">
                                {studyTime.minutes}
                              </span>
                              <span className="text-2xl text-muted-foreground ml-2">minutes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
       </div>

    </div>
  );
}
