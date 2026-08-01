import { z } from 'zod';
import { Schema } from '../types';

export const DailyStressRecordSchema = {
  name: 'daily-stress-record',
  schema: z
    .object({
      anxiety: z
        .int()
        .min(0)
        .max(5)
        .optional()
        .describe('Anxiety level experienced during the day. 0 means no anxiety; 5 means the highest tolerable anxiety.'),
      ruminationMinutes: z
        .int()
        .min(0)
        .optional()
        .describe('Approximate total number of minutes spent on repetitive or intrusive anxious thoughts.'),
      healthChecks: z
        .int()
        .min(0)
        .optional()
        .describe(
          'Number of unplanned health checks performed during the day, excluding measurements from a predefined medical schedule.'
        ),
      reassuranceSearches: z
        .int()
        .min(0)
        .optional()
        .describe('Number of attempts to obtain reassurance about health or another feared outcome.'),
      functioningImpact: z
        .int()
        .min(0)
        .max(5)
        .optional()
        .describe(
          'Degree to which anxiety interfered with normal activities, work, concentration, exercise, or social interaction.  0 means no impact; 5 means the highest possible impact.'
        ),
      sleepHours: z
        .number()
        .min(0)
        .optional()
        .describe('Total sleep duration in hours. Decimal values are allowed, for example 7.5.'),
      sleepQuality: z
        .int()
        .min(0)
        .max(10)
        .optional()
        .describe('Subjective sleep quality. 0 means extremely poor sleep; 10 means excellent sleep.'),
      workStress: z.int().min(0).max(5).optional().describe('Subjective work-related stress.'),
      mood: z
        .int()
        .min(0)
        .max(5)
        .optional()
        .describe('Overall mood. 0 means extremely poor mood; 5 means excellent mood.'),
      notes: z
        .string()
        .optional()
        .describe(
          'Short optional note describing unusual events, illness, conflicts, intense exercise, poor sleep, medication, or other relevant context.'
        )
    })
    .describe(
      'Stores one aggregated record per calendar day, capturing anxiety, rumination, health-related checking, sleep, exercise, stress, mood, and daily functioning.'
    )
} satisfies Schema;
