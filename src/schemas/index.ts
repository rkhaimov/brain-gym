import { Schema } from '../types';
import { AnxietyEpisodeRecordSchema } from './anxietyEpisodeRecord';
import { BloodPressureMeasurementSchema } from './bpm';
import { DailyStressRecordSchema } from './dailyStressRecord';

export const schemas: Schema[] = [
  BloodPressureMeasurementSchema,
  DailyStressRecordSchema,
  AnxietyEpisodeRecordSchema
];
