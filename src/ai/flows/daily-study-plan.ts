'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ---------- Input ----------
const DailyStudyPlanInputSchema = z.object({
  availableMinutes: z.number().describe('Total minutes the student has available today.'),
  exams: z.string().describe('Comma-separated list of upcoming exams with days until exam, e.g. "Mathematics in 2 days, Science in 5 days".'),
  userName: z.string().describe('First name of the student.'),
  isUnder15: z.boolean().describe('Whether the student is under 15 years old.'),
});
export type DailyStudyPlanInput = z.infer<typeof DailyStudyPlanInputSchema>;

// ---------- Output ----------
const SessionSchema = z.object({
  sessionNumber: z.number(),
  subject: z.string(),
  topic: z.string(),
  durationMinutes: z.number(),
  breakMinutes: z.number(),
});

const DailyStudyPlanOutputSchema = z.object({
  todaySubject: z.string().describe('The most important subject to focus on today.'),
  headline: z.string().describe('One punchy sentence explaining why this subject was chosen.'),
  sessions: z.array(SessionSchema).describe('Pomodoro-style sessions for the day.'),
  focusTopics: z.array(z.string()).describe('2-4 specific topics to cover today.'),
  motivationMessage: z.string().describe('Flower/garden-themed motivational message. More playful for under-15.'),
  tip: z.string().describe('One practical study tip for today.'),
});
export type DailyStudyPlanOutput = z.infer<typeof DailyStudyPlanOutputSchema>;

// ---------- Prompt ----------
const dailyPlanPrompt = ai.definePrompt({
  name: 'dailyStudyPlanPrompt',
  input: { schema: DailyStudyPlanInputSchema },
  output: { schema: DailyStudyPlanOutputSchema },
  prompt: `You are FocusFlow's AI Study Coach. Your role is to create a personalized daily study plan with a flower-garden metaphor.

Student name: {{{userName}}}
Available time today: {{{availableMinutes}}} minutes
Upcoming exams: {{{exams}}}
Under 15 years old: {{{isUnder15}}}

Rules:
1. Choose the most urgent exam subject as today's focus.
2. Split available time into Pomodoro sessions (25 min study + 5 min break). If time < 25 min, make one shorter session.
3. Each session should have a specific topic to cover (not vague).
4. The motivationMessage MUST use flower/garden metaphors (e.g. "Your sunflower is about to bloom!", "Each minute you study waters your garden!").
5. If isUnder15 is true: use simpler language, more emojis, and extra-encouraging garden metaphors. Call the student "little gardener" once.
6. If isUnder15 is false: use a more mature but still motivating tone.
7. The headline should mention the exam and urgency.
8. tip should be one concrete, actionable tip (e.g. "Use flashcards for formulas").
9. Respond ONLY with the JSON, no extra text.
`,
});

// ---------- Flow ----------
const dailyStudyPlanFlow = ai.defineFlow(
  {
    name: 'dailyStudyPlanFlow',
    inputSchema: DailyStudyPlanInputSchema,
    outputSchema: DailyStudyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await dailyPlanPrompt(input);
    return output!;
  }
);

export async function generateDailyStudyPlan(input: DailyStudyPlanInput): Promise<DailyStudyPlanOutput> {
  return dailyStudyPlanFlow(input);
}
