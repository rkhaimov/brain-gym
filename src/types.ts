import { z } from 'zod';

export type Schema = {
  name: string;
  schema: z.ZodObject;
};
