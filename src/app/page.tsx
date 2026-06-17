
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { StudyTimer } from '@/components/dashboard/StudyTimer';
import { UpcomingAchievements } from '@/components/dashboard/UpcomingAchievements';
import { ParentPinModal } from '@/components/dashboard/ParentPinModal';
import { SECONDS_TO_GROW_FLOWER, SUBJECT_FLOWER_LOTTIE } from '@/lib/constants';
import { checkIsUnder15 } from '@/lib/utils';
import { sendParentOtpEmail, generateOtp } from '@/lib/emailjs';
import { useToast } from '@/hooks/use-toast';
import { achievements } from '@/lib/data';
import { useUser, useDoc, useCollection, supabase } from '@/supabase';
import { useRouter } from 'next/navigation';
import type { StudySession, UserProfile } from '@/lib/types';
import { LoaderCircle, Zap, AlertTriangle } from 'lucide-react';
import type { LottieRefCurrentProps } from 'lottie-react';
import { useLanguage } from '@/lib/i18n-context';
import { useTimerContext } from '@/contexts/timer-context';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface PendingSession {
  id: string;
  duration: number; // seconds
  subject: string;
  durationMinutes: number;
}

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { t } = useLanguage();
  const timer = useTimerContext();

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(
    'users', user?.id || null, !!user
  );
  const { data: studySessions, isLoading: isSessionsLoading } = useCollection<StudySession>(
    'study_sessions',
    user ? [{ column: 'user_id', value: user.id }] : undefined,
    !!user
  );

  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  const [lottieData, setLottieData] = useState<any>(null);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [sessionMultiplier, setSessionMultiplier] = useState(1.0);
  const [activeIntensity, setActiveIntensity] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const path = SUBJECT_FLOWER_LOTTIE[timer.subject] ?? '/lottie/flower_mavi.json';
    setLottieData(null);
    fetch(path).then(r => r.json()).then(setLottieData).catch(() => {});
  }, [timer.subject]);

  // Read active plan passed from study-plan page via localStorage
  useEffect(() => {
    const stored = localStorage.getItem('focusflow-active-plan');
    if (!stored) return;
    try {
      const plan = JSON.parse(stored);
      if (plan.subject) timer.setSubject(plan.subject);
      if (plan.duration) timer.setDuration(plan.duration);
      if (plan.multiplier) setSessionMultiplier(plan.multiplier);
      if (plan.intensity) setActiveIntensity(plan.intensity as string);
      localStorage.removeItem('focusflow-active-plan');
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Lottie frame with timer progress
  useEffect(() => {
    if (!lottieRef.current || !lottieData) return;
    const totalFrames = ((lottieData.op as number) || 100) - ((lottieData.ip as number) || 0);
    if (timer.status === 'stopped') {
      lottieRef.current.goToAndStop(0, true);
      return;
    }
    const targetFrame = Math.floor((timer.sessionProgress / 100) * totalFrames);
    lottieRef.current.goToAndStop(Math.min(targetFrame, totalFrames - 1), true);
  }, [timer.sessionProgress, timer.status, lottieData]);

  useEffect(() => {
    if (!isUserLoading && !user) router.push('/login');
  }, [user, isUserLoading, router]);

  const totalStudyTime = userProfile?.total_study_time ?? 0;
  const isUnder15 = checkIsUnder15(userProfile?.date_of_birth);

  const unlockAchievement = useCallback((achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      toast({ title: "Achievement Unlocked! 🏆", description: `You've earned the "${achievement.title}" badge!` });
    }
  }, [toast]);

  const handleFlowerAndAchievements = useCallback((newTotalStudyTime: number) => {
    const oldFlowers = Math.floor(totalStudyTime / SECONDS_TO_GROW_FLOWER);
    const newFlowers = Math.floor(newTotalStudyTime / SECONDS_TO_GROW_FLOWER);
    if (newFlowers > oldFlowers) {
      toast({ title: "New Flower Grown! 🌸", description: "You've completed a full growth cycle. Check your garden!" });
    }
    achievements.forEach(achievement => {
      if (!achievement.unlocked && newTotalStudyTime >= achievement.milestoneHours * 3600) {
        unlockAchievement(achievement.id);
      }
    });
    unlockAchievement('perfect-timing');
  }, [totalStudyTime, toast, unlockAchievement]);

  const handleSessionComplete = useCallback(async (sessionDuration: number, subject: string) => {
    if (!user) return;
    const now = new Date();
    const startTime = new Date(now.getTime() - sessionDuration * 1000);
    const durationMinutes = Math.round(sessionDuration / 60);
    const under15 = checkIsUnder15(userProfile?.date_of_birth);
    const effectiveDuration = Math.round(sessionDuration * sessionMultiplier);

    const { data: sessionData, error: sessionError } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        subject_id: subject,
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        duration: durationMinutes,
        is_verified: !under15,
      })
      .select('id')
      .single();

    if (sessionError) {
      toast({ variant: 'destructive', title: 'Session could not be saved', description: sessionError.message });
      return;
    }

    if (!under15) {
      const newTotalStudyTime = totalStudyTime + effectiveDuration;
      const { data: updated } = await supabase
        .from('users')
        .update({ total_study_time: newTotalStudyTime })
        .eq('id', user.id)
        .select('id');
      if (!updated || updated.length === 0) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email || null,
          username: user.user_metadata?.username || null,
          total_study_time: newTotalStudyTime,
          companion_clicks: 0,
        });
      }
      handleFlowerAndAchievements(newTotalStudyTime);
    } else if (!userProfile?.parent_email) {
      const newTotalStudyTime = totalStudyTime + effectiveDuration;
      await supabase.from('study_sessions').update({ is_verified: true }).eq('id', sessionData.id);
      const { data: updated } = await supabase
        .from('users')
        .update({ total_study_time: newTotalStudyTime })
        .eq('id', user.id)
        .select('id');
      if (!updated || updated.length === 0) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email || null,
          username: user.user_metadata?.username || null,
          total_study_time: newTotalStudyTime,
          companion_clicks: 0,
        });
      }
      handleFlowerAndAchievements(newTotalStudyTime);
      toast({ title: "Session Complete! 🌸", description: "Add a parent email in your profile to enable parental control." });
    } else {
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await supabase.from('users').update({ otp_code: otp, otp_expires_at: expiresAt }).eq('id', user.id);
      setPendingSession({ id: sessionData.id, duration: sessionDuration, subject, durationMinutes });
      setShowPinModal(true);
      setIsSendingOtp(true);
      await sendParentOtpEmail({
        parentEmail: userProfile.parent_email,
        studentName: userProfile.username || user.email || 'Your child',
        subject, durationMinutes, otpCode: otp,
      });
      setIsSendingOtp(false);
      toast({ title: "Session Complete! 🌱", description: `Verification code sent to ${userProfile.parent_email}` });
    }
  }, [totalStudyTime, user, userProfile, toast, handleFlowerAndAchievements, sessionMultiplier]);

  // Watch context for session completion (fires when timer reaches 0 on any page)
  useEffect(() => {
    if (!timer.sessionCompleted) return;
    handleSessionComplete(timer.sessionCompleted.durationSeconds, timer.sessionCompleted.subject);
    timer.clearSessionCompleted();
  }, [timer.sessionCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOtpVerify = useCallback(async (enteredCode: string): Promise<boolean> => {
    if (!user || !pendingSession || !userProfile) return false;
    const storedOtp = userProfile.otp_code;
    const expiresAt = userProfile.otp_expires_at ? new Date(userProfile.otp_expires_at) : null;
    if (!storedOtp || enteredCode !== storedOtp) return false;
    if (expiresAt && new Date() > expiresAt) {
      toast({ variant: 'destructive', title: 'Code expired', description: 'Please request a new code.' });
      return false;
    }
    await supabase.from('study_sessions').update({ is_verified: true }).eq('id', pendingSession.id);
    const newTotalStudyTime = totalStudyTime + pendingSession.duration;
    const { data: updated } = await supabase
      .from('users')
      .update({ total_study_time: newTotalStudyTime, otp_code: null, otp_expires_at: null })
      .eq('id', user.id)
      .select('id');
    if (!updated || updated.length === 0) {
      await supabase.from('users').insert({
        id: user.id,
        email: user.email || null,
        username: user.user_metadata?.username || null,
        total_study_time: newTotalStudyTime,
        companion_clicks: 0,
      });
    }
    handleFlowerAndAchievements(newTotalStudyTime);
    setShowPinModal(false);
    setPendingSession(null);
    toast({ title: 'Session Verified! 🌸', description: 'Parent approved. Your flower is growing!' });
    return true;
  }, [user, pendingSession, userProfile, totalStudyTime, handleFlowerAndAchievements, toast]);

  const handleOtpResend = useCallback(async () => {
    if (!user || !userProfile?.parent_email || !pendingSession) return;
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await supabase.from('users').update({ otp_code: otp, otp_expires_at: expiresAt }).eq('id', user.id);
    setIsSendingOtp(true);
    await sendParentOtpEmail({
      parentEmail: userProfile.parent_email,
      studentName: userProfile.username || user.email || 'Your child',
      subject: pendingSession.subject,
      durationMinutes: pendingSession.durationMinutes,
      otpCode: otp,
    });
    setIsSendingOtp(false);
  }, [user, userProfile, pendingSession]);

  const handlePinModalClose = useCallback(() => {
    setShowPinModal(false);
    setPendingSession(null);
  }, []);

  if (isUserLoading || isProfileLoading || isSessionsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const flowerProgress = timer.status === 'running' || timer.status === 'paused'
    ? timer.sessionProgress
    : (totalStudyTime % SECONDS_TO_GROW_FLOWER) / SECONDS_TO_GROW_FLOWER * 100;

  return (
    <div className="flex-1 container mx-auto p-4 md:p-8">
      {pendingSession && userProfile?.parent_email && (
        <ParentPinModal
          isOpen={showPinModal}
          parentEmail={userProfile.parent_email}
          subject={pendingSession.subject}
          durationMinutes={pendingSession.durationMinutes}
          isSendingOtp={isSendingOtp}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          onClose={handlePinModalClose}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-center">
        {/* Sol kolon — büyük Lottie çiçeği */}
        <div className="w-full flex flex-col items-center justify-center order-2 lg:order-1">
          <div className="w-64 sm:w-72 lg:w-full lg:max-w-xs xl:max-w-sm">
            {lottieData ? (
              <Lottie
                lottieRef={lottieRef}
                animationData={lottieData}
                autoplay={false}
                loop={false}
                style={{ width: '100%', height: 'auto' }}
              />
            ) : (
              <div className="aspect-square w-full rounded-full bg-primary/5 flex items-center justify-center">
                <span className="text-6xl">🌸</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-muted-foreground tracking-wide">
            {timer.status === 'running'
              ? t('dashboard.growing')
              : timer.status === 'paused'
              ? t('dashboard.paused')
              : t('dashboard.readyToGrow')}
          </p>
        </div>

        {/* Orta kolon — timer */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center gap-4 order-1 lg:order-2">
          {activeIntensity && sessionMultiplier > 1 && (
            <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              {{ light: '☀️', normal: '⚡', hard: '🔥' }[activeIntensity]} {t(`readyPlanner.templates.${activeIntensity}.label`)} {t('readyPlanner.modSuffix')} · {sessionMultiplier}x {t('readyPlanner.multiplierSuffix')}
            </div>
          )}
          <StudyTimer />
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 max-w-sm w-full">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-snug">
              {t('dashboard.timerReminder')}
            </p>
          </div>
        </div>

        {/* Sağ kolon — başarımlar */}
        <div className="w-full order-3 lg:order-3">
          <UpcomingAchievements currentStudyTime={totalStudyTime} />
        </div>
      </div>
    </div>
  );
}
