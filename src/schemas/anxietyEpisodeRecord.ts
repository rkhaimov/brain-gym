import { z } from 'zod';
import { Schema } from '../types';

export const AnxietyEpisodeRecordSchema = {
  name: 'anxiety-episode-record',
  schema: z
    .object({
      trigger: z
        .string()
        .describe(
          'Short factual description of what happened immediately before the episode, such as feedback from a colleague, a chest sensation, a medical result, or an upcoming meeting.'
        ),
      anxietyBefore: z
        .int()
        .min(0)
        .max(5)
        .optional()
        .describe('Anxiety level immediately before the trigger. 0 means no anxiety; 5 means highest anxiety.'),
      peakAnxiety: z
        .int()
        .min(0)
        .max(5)
        .describe('Highest anxiety level reached during the episode. 0 means no anxiety; 5 means highest anxiety.'),
      durationMinutes: z
        .int()
        .min(0)
        .optional()
        .describe('Approximate duration of the episode in minutes until anxiety meaningfully decreased.'),
      bodySymptoms: z
        .string()
        .optional()
        .describe(
          'Semicolon-separated physical sensations, such as rapid heartbeat; chest tightness; sweating; muscle tension.'
        ),
      automaticThought: z
        .string()
        .optional()
        .describe(
          'The first threatening interpretation or prediction that appeared. Record the thought rather than an analysis of whether it was correct.'
        ),
      response: z
        .string()
        .optional()
        .describe(
          'What the person deliberately did in response, such as continued working, used slow breathing, took a walk, or discussed the issue directly.'
        ),
      safetyBehavior: z
        .string()
        .optional()
        .describe(
          'Behavior used primarily to immediately reduce uncertainty or feel safe, such as checked pulse, measured blood pressure, searched symptoms, avoided activity, or requested reassurance. Leave empty when no safety behavior occurred.'
        ),
      anxietyAfter: z
        .int()
        .min(0)
        .max(5)
        .optional()
        .describe('Anxiety level after the episode or after the selected response. 0 means no anxiety; 5 means highest anxiety.'),
      functioningImpact: z
        .int()
        .min(0)
        .max(5)
        .optional()
        .describe('Degree to which the episode disrupted normal activity. 0 means no impact; 5 means highest impact.'),
      notes: z.string().optional().describe('Optional contextual information.')
    })
    .describe(
      'Stores one record for each distinct anxiety episode. It is intended to identify common triggers, thoughts, physical reactions, coping responses, safety behaviors, and recovery patterns.'
    )
} satisfies Schema;
