'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useDoc } from '@/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoaderCircle, Clock, Flame, Award } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import type { StudySession, UserProfile } from '@/lib/types';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { achievements } from '@/lib/data';
import { cn } from '@/lib/utils';

const SUBJECT_OPTIONS = ["Mathematics", "Science", "Social Studies", "English"];

// Clean color palette
const subjectColors: Record<string, string> = {
  "Mathematics": "#60A5FA", // Soft Blue
  "Science": "#34D399", // Sage Green
  "Social Studies": "#FB923C", // Pastel Orange
  "English": "#A78BFA", // Muted Purple
};

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Calculate daily streak
function calculateDailyStreak(sessions: StudySession[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Get unique study dates
  const studyDates = new Set<string>();
  sessions.forEach(session => {
    const date = new Date(session.start_time || session.startTime || session.created_at || '');
    if (!isNaN(date.getTime())) {
      const dateStr = date.toISOString().split('T')[0];
      studyDates.add(dateStr);
    }
  });

  if (studyDates.size === 0) return 0;

  // Sort dates
  const sortedDates = Array.from(studyDates).sort().reverse();
  
  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === i) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Get focus level based on total study time
function getFocusLevel(totalHours: number): { label: string; color: string } {
  if (totalHours < 1) {
    return { label: "Seedling", color: "text-green-600" };
  } else if (totalHours < 5) {
    return { label: "Sprout", color: "text-blue-600" };
  } else if (totalHours < 10) {
    return { label: "Growing", color: "text-purple-600" };
  } else if (totalHours < 20) {
    return { label: "Blooming", color: "text-pink-600" };
  } else {
    return { label: "Master Gardener", color: "text-amber-600" };
  }
}

export default function AnalysisPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Get user profile for total study time
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(
    'users',
    user?.id || null,
    !!user
  );

  // Get study sessions
  const { data: studySessions, isLoading: isSessionsLoading } = useCollection<StudySession>(
    'study_sessions',
    user ? [{ column: 'user_id', value: user.id }] : undefined,
    !!user
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStudyTimeSeconds = userProfile?.total_study_time || 0;
    const totalStudyTimeHours = totalStudyTimeSeconds / 3600;
    const dailyStreak = calculateDailyStreak(studySessions || []);
    const focusLevel = getFocusLevel(totalStudyTimeHours);

    return {
      totalHours: totalStudyTimeHours,
      dailyStreak,
      focusLevel,
    };
  }, [userProfile, studySessions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!studySessions || studySessions.length === 0) {
      return SUBJECT_OPTIONS.map(subject => ({
        subject,
        minutes: 0,
        fill: subjectColors[subject] || "#94A3B8",
      }));
    }

    const subjectDurations: { [key: string]: number } = {};
    studySessions.forEach(session => {
      const subjectName = session.subject_id || session.subjectId || 'Uncategorized';
      if (!subjectDurations[subjectName]) {
        subjectDurations[subjectName] = 0;
      }
      subjectDurations[subjectName] += session.duration;
    });

    return SUBJECT_OPTIONS.map(subject => ({
      subject: subject.split(' ')[0], // Short name for chart
      fullSubject: subject,
      minutes: Math.round(subjectDurations[subject] || 0),
      fill: subjectColors[subject] || "#94A3B8",
    }));
  }, [studySessions]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    return chartData.filter(item => item.minutes > 0);
  }, [chartData]);

  // Get unlocked achievements based on total study time
  const unlockedAchievements = useMemo(() => {
    const totalHours = stats.totalHours;
    return achievements.map(achievement => ({
      ...achievement,
      unlocked: achievement.unlocked || (achievement.milestoneHours > 0 && totalHours >= achievement.milestoneHours),
    }));
  }, [stats.totalHours]);

  const isLoading = isUserLoading || isProfileLoading || (user && isSessionsLoading);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">Analysis</h1>
        <p className="text-muted-foreground text-lg">
          Insights into your study journey
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Study Time</p>
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
                <p className="text-sm text-muted-foreground mb-1">Daily Streak</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.dailyStreak} <span className="text-xl text-muted-foreground">days</span>
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
                <p className="text-sm text-muted-foreground mb-1">Focus Level</p>
                <p className={cn("text-3xl font-bold", stats.focusLevel.color)}>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Bar Chart */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Time Spent per Subject</CardTitle>
            <CardDescription>Total minutes studied for each subject</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.some(item => item.minutes > 0) ? (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <XAxis 
                      dataKey="subject" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}m`} 
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: "hsl(var(--secondary))" }} 
                    />
                    <Bar 
                      dataKey="minutes" 
                      radius={[8, 8, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p>No study data yet. Complete a session to see your analysis!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Subject Distribution</CardTitle>
              <CardDescription>Percentage breakdown of study time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ subject, percent }) => `${subject}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="minutes"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievements Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Unlock badges by reaching study milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {unlockedAchievements
              .filter(achievement => !achievement.hidden)
              .map((achievement) => {
                const Icon = achievement.Icon;
                return (
                  <div
                    key={achievement.id}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all hover:scale-105",
                      achievement.unlocked
                        ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                        : "border-muted bg-muted/30 grayscale opacity-60"
                    )}
                  >
                    <div
                      className={cn(
                        "p-4 rounded-full mb-3 transition-all",
                        achievement.unlocked
                          ? "bg-primary/10 text-primary shadow-md"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "h-8 w-8",
                        achievement.unlocked && "drop-shadow-lg"
                      )} />
                    </div>
                    <p className={cn(
                      "text-sm font-semibold text-center",
                      achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {achievement.title}
                    </p>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
