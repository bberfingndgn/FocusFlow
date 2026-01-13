'use server';

/**
 * @fileOverview A Genkit flow that provides dynamic and personalized encouragement based on the student's progress and timer status.
 *
 * - generateEncouragement - A function that generates an encouragement message.
 * - GenerateEncouragementInput - The input type for the generateEncouragement function.
 * - GenerateEncouragementOutput - The return type for the generateEncouragement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEncouragementInputSchema = z.object({
  progressPercentage: z
    .number()
    .describe("The student's progress percentage in the current study session (0-100)."),
  timerStatus: z
    .enum(['running', 'paused', 'stopped'])
    .describe('The current status of the study timer.'),
  userName: z.string().describe('The name of the student.'),
});
export type GenerateEncouragementInput = z.infer<typeof GenerateEncouragementInputSchema>;

const GenerateEncouragementOutputSchema = z.object({
  encouragementMessage: z.string().describe('The generated encouragement message.'),
});
export type GenerateEncouragementOutput = z.infer<typeof GenerateEncouragementOutputSchema>;

export async function generateEncouragement(
  input: GenerateEncouragementInput
): Promise<GenerateEncouragementOutput> {
  return generateEncouragementFlow(input);
}

const encouragementPrompt = ai.definePrompt({
  name: 'encouragementPrompt',
  input: {schema: GenerateEncouragementInputSchema},
  output: {schema: GenerateEncouragementOutputSchema},
  prompt: `You are a friendly and supportive study companion. Your goal is to provide encouragement to students to help them stay motivated during their study sessions.

  The student's name is {{userName}}.
  The current timer status is: {{timerStatus}}.
  The student's progress in the current session is: {{progressPercentage}}%.

  Generate a short, personalized encouragement message that takes into account their progress and the timer status. Tailor the message to be appropriate and uplifting.

  Here are some example messages:
  - "Keep up the great work, {{userName}}! You're making excellent progress."
  - "Don't give up now, {{userName}}! You're almost there."
  - "Time for a break, {{userName}}! You deserve it."
  - "Welcome back, {{userName}}! Let's get back to studying."
  `,
});

const generateEncouragementFlow = ai.defineFlow(
  {
    name: 'generateEncouragementFlow',
    inputSchema: GenerateEncouragementInputSchema,
    outputSchema: GenerateEncouragementOutputSchema,
  },
  async input => {
    const {output} = await encouragementPrompt(input);
    return output!;
  }
);
