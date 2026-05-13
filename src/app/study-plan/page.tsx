"use client";

import { useEffect } from "react";
import { useUser, useDoc } from "@/supabase";
import { useRouter } from "next/navigation";
import { AiStudyPlanner } from "@/components/dashboard/AiStudyPlanner";
import type { UserProfile } from "@/lib/types";
import { LoaderCircle } from "lucide-react";
import { checkIsUnder15 } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

export default function StudyPlanPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(
    "users",
    user?.id || null,
    !!user
  );

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isUnder15 = checkIsUnder15(userProfile?.date_of_birth);
  const userName = userProfile?.username || user.email?.split("@")[0] || "Student";
  const { t } = useLanguage();

  return (
    <div className="flex-1 container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary flex items-center justify-center gap-2">
          {t('studyPlan.title')}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {isUnder15 ? t('studyPlan.subtitleKid') : t('studyPlan.subtitleAdult')}
        </p>
      </div>
      <AiStudyPlanner userName={userName} isUnder15={isUnder15} />
    </div>
  );
}
