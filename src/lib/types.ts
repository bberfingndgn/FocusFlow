import type { LucideIcon } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  milestoneHours: number;
  unlocked: boolean;
  Icon: LucideIcon;
  hidden?: boolean; // For secret achievements
  reward?: {
    type: 'flower' | 'decoration' | 'costume';
    item: string;
  }
}

export interface GrownFlower {
  id: string;
  flowerTypeId: string;
  grownAt: Date;
  subject: string;
}

export interface StudySession {
    id: string;
    user_id: string;
    subject_id: string;
    start_time: string;
    end_time: string;
    duration: number; // in minutes
    is_verified: boolean;
    created_at?: string;
    // Legacy fields for backward compatibility during migration
    userId?: string;
    subjectId?: string;
    startTime?: string;
    endTime?: string;
}

export interface UserProfile {
    id: string;
    username: string | null;
    email: string | null;
    created_at: string;
    total_study_time: number;
    companion_clicks: number;
    date_of_birth?: string | null;
    parent_email?: string | null;
    otp_code?: string | null;
    otp_expires_at?: string | null;
    // Legacy fields for backward compatibility during migration
    createdAt?: string;
    totalStudyTime?: number;
    companionClicks?: number;
}
