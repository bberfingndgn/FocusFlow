import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  neglectedSubjects: z.array(z.string()),
  totalMinutes: z.record(z.string(), z.number()),
  userName: z.string(),
});

const OutputSchema = z.object({
  motivations: z.record(z.string(), z.string()),
});

export type SubjectMotivationInput = z.infer<typeof InputSchema>;
export type SubjectMotivationOutput = z.infer<typeof OutputSchema>;

export const generateSubjectMotivation = ai.defineFlow(
  { name: 'generateSubjectMotivation', inputSchema: InputSchema, outputSchema: OutputSchema },
  async (input) => {
    const list = input.neglectedSubjects
      .map(s => `- ${s}: ${input.totalMinutes[s] ?? 0} dakika`)
      .join('\n');

    const { output } = await ai.generate({
      prompt: `Sen FocusFlow adlı bir çalışma uygulamasının arkadaşça koç asistanısın. Öğrencinin adı: ${input.userName}.

Öğrenci şu derslere yeterince vakit ayıramamış:
${list}

Her ihmal edilen ders için 1-2 cümlelik, samimi, motive edici ve Türkçe bir mesaj yaz. Çiçek/bahçe metaforunu kullanabilirsin. Mesajları doğrudan öğrenciye hitap ederek yaz.

SADECE JSON formatında yanıt ver, başka hiçbir şey ekleme:
{
  "motivations": {
    "DersAdı": "Motivasyon mesajı.",
    ...
  }
}`,
      output: { schema: OutputSchema },
    });

    return output ?? { motivations: {} };
  }
);
