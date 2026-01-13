'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useCollection } from '@/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Clock, Book, ArrowLeft } from 'lucide-react';
import type { StudySession } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SubjectDetailPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const subjectName = useMemo(() => {
    const name = params.subjectName;
    return typeof name === 'string' ? decodeURIComponent(name) : '';
  }, [params.subjectName]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Supabase: useCollection for study sessions filtered by user
  const { data: studySessions, isLoading: isSessionsLoading } = useCollection<StudySession>(
    'study_sessions',
    user ? [{ column: 'user_id', value: user.id }] : undefined,
    !!user
  );

  const { totalHours, totalMinutes } = useMemo(() => {
    if (!studySessions) return { totalHours: 0, totalMinutes: 0 };

    // Filter by subject name (since we can't use multiple filters in useCollection easily)
    const totalDurationInMinutes = studySessions
      .filter(session => (session.subject_id || session.subjectId) === subjectName)
      .reduce((acc, session) => acc + session.duration, 0);

    const totalHours = Math.floor(totalDurationInMinutes / 60);
    const totalMinutes = Math.round(totalDurationInMinutes % 60);
    
    return { totalHours, totalMinutes };
  }, [studySessions, subjectName]);

  if (isUserLoading || isSessionsLoading) {
    return <div className="flex-1 flex items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
       <Button asChild variant="ghost" className="mb-6">
        <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Link>
      </Button>

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
             <div className="flex justify-center items-center gap-4 mb-4">
                <Book className="w-10 h-10 text-primary" />
                <CardTitle className="text-4xl font-bold font-headline text-primary">{subjectName}</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
             <p className="text-lg text-muted-foreground">Total study time for this subject:</p>
             <div className="flex items-center justify-center gap-4 text-5xl font-bold text-foreground">
                <Clock className="w-12 h-12 text-accent" />
                <span>{totalHours}<span className="text-3xl text-muted-foreground">h</span> {totalMinutes}<span className="text-3xl text-muted-foreground">m</span></span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
