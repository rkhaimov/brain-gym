import { z } from 'zod';

export const ImplementationSchema = z.object({
  code: z.string(),
});

export const UtilsSchema = z.array(
  z.object({
    module: z.string().describe('Module path'),
    source: z.string().describe('Source'),
  }),
);

const FileSchema = z.object({
  path: z.string().describe('Filename'),
  source: z.string().describe('Source'),
});

const BundleSchema = z.object({
  test: FileSchema,
  main: FileSchema,
});

export const CheckFailureBodySchema = z.object({
  bundle: BundleSchema,
  stage: z.enum(['compile', 'test']),
  errors: z.string().describe('Errors happened during stage execution'),
});

export type Implementation = z.Infer<typeof ImplementationSchema>;
export type Utils = z.Infer<typeof UtilsSchema>;
export type Bundle = z.Infer<typeof BundleSchema>;
export type CheckFailureBody = z.Infer<typeof CheckFailureBodySchema>;
