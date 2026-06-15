"use server";

import { generateStudyPlan, type StudyPlanInput } from "@/ai/flows/personalized-study-plan";
import { generateDailyStudyPlan, type DailyStudyPlanInput, type DailyStudyPlanOutput } from "@/ai/flows/daily-study-plan";
import { generateSubjectMotivation, type SubjectMotivationInput } from "@/ai/flows/subject-motivation";
import { z } from "zod";

const StudyPlanFormSchema = z.object({
    subjects: z.string().min(3, "Please enter at least one subject."),
    availableTime: z.string().min(5, "Please describe your available time."),
    learningPreferences: z.string().min(5, "Please describe your learning preferences.")
});

interface FormState {
  studyPlan: string | null;
  error: string | null;
  fieldErrors?: {
    subjects?: string[];
    availableTime?: string[];
    learningPreferences?: string[];
  };
}

export async function generateStudyPlanAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const validatedFields = StudyPlanFormSchema.safeParse({
    subjects: formData.get('subjects'),
    availableTime: formData.get('availableTime'),
    learningPreferences: formData.get('learningPreferences'),
  });

  if (!validatedFields.success) {
    return {
      studyPlan: null,
      error: "Please check the form for errors.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateStudyPlan(validatedFields.data as StudyPlanInput);
    return {
      studyPlan: result.studyPlan,
      error: null,
      fieldErrors: {},
    };
  } catch (err: any) {
    return {
      studyPlan: null,
      error: err?.message ?? "There was an issue with the AI. Please try again.",
      fieldErrors: {},
    };
  }
}

// ---------- Daily Study Plan Action ----------
export interface DailyPlanResult {
  plan: DailyStudyPlanOutput | null;
  error: string | null;
}

export async function generateDailyPlanAction(input: DailyStudyPlanInput): Promise<DailyPlanResult> {
  try {
    const plan = await generateDailyStudyPlan(input);
    return { plan, error: null };
  } catch (err: any) {
    const message = err?.message ?? String(err);
    console.error('[generateDailyPlanAction]', message);
    if (message.includes('API key') || message.includes('apiKey') || message.includes('401')) {
      return { plan: null, error: 'Gemini API key is missing or invalid. Check your .env.local file.' };
    }
    if (message.includes('quota') || message.includes('429')) {
      return { plan: null, error: 'Gemini API quota exceeded. Please wait a moment and try again.' };
    }
    return { plan: null, error: `AI error: ${message}` };
  }
}

// ---------- Subject Motivation Action ----------
export interface SubjectMotivationResult {
  motivations: Record<string, string> | null;
  error: string | null;
}

export async function generateSubjectMotivationAction(
  input: SubjectMotivationInput
): Promise<SubjectMotivationResult> {
  try {
    const result = await generateSubjectMotivation(input);
    return { motivations: result.motivations, error: null };
  } catch (err: any) {
    const message = err?.message ?? String(err);
    console.error('[generateSubjectMotivationAction]', message);
    return { motivations: null, error: message };
  }
}
