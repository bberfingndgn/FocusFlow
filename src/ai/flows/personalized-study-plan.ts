'use server';

/**
 * @fileOverview Generates a personalized study plan based on user input.
 *
 * - generateStudyPlan - A function that generates a study plan.
 * - StudyPlanInput - The input type for the generateStudyPlan function.
 * - StudyPlanOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyPlanInputSchema = z.object({
  subjects: z
    .string()
    .describe('The subjects the student needs to study for, separated by commas.'),
  availableTime: z
    .string()
    .describe('The amount of time the student has available to study, e.g., 2 hours per day.'),
  learningPreferences: z
    .string()
    .describe(
      'The student’s learning preferences, such as preferred study environment, learning style, and tools.'
    ),
});
export type StudyPlanInput = z.infer<typeof StudyPlanInputSchema>;

const StudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe('A personalized study plan for the student.'),
});
export type StudyPlanOutput = z.infer<typeof StudyPlanOutputSchema>;

export async function generateStudyPlan(input: StudyPlanInput): Promise<StudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyPlanPrompt',
  input: {schema: StudyPlanInputSchema},
  output: {schema: StudyPlanOutputSchema},
  prompt: `You are an AI study plan generator. Create a personalized study plan for the student based on the following information:

Subjects: {{{subjects}}}
Available Time: {{{availableTime}}}
Learning Preferences: {{{learningPreferences}}}

The study plan should include optimal study durations, break intervals, and specific study activities for each subject. The study plan should be realistic and achievable, taking into account the student's available time and learning preferences. Return the study plan as a string.
`,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: StudyPlanInputSchema,
    outputSchema: StudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
