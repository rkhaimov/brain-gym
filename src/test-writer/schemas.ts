import { z } from 'zod';
import { RequirementsSchema } from '../requirements-creator/schemas';

export const TestsSchema = z.object({
  description: z
    .string()
    .describe('Short functionality description which is being tested'),
  suits: z.array(
    z.object({
      description: z
        .string()
        .describe(
          'Suite description starting from the verb (in third person singular present simple)',
        ),
      args: z
        .array(z.string().describe('Argument value (e.g. "foo", "foo=bar")'))
        .describe('CLI command arguments'),
      steps: z.array(
        z.discriminatedUnion('type', [
          z
            .object({
              type: z.literal('output'),
              target: z.enum(['stdout', 'stderr']),
              output: z
                .string()
                .describe('Output to assert against using exact match'),
            })
            .describe(
              'Asserts against expected output (both stdout and stderr)',
            ),
          z
            .object({
              type: z.literal('input'),
              input: z.string().describe('Input to pass to a program'),
            })
            .describe(
              'Emulates input to stdin. Used for interactive mode only. For process level argv, use args property',
            ),
        ]),
      ),
      exit: z
        .number()
        .default(0)
        .describe('Exit code with which a program should exit'),
    }),
  ),
});

export const IssuesSchema = z.array(
  z.object({
    title: z.string().describe('Short title'),
    problem: z.string().describe('What is wrong'),
  }),
);

export const ContextSchema = z.object({
  requirements: RequirementsSchema,
  tests: TestsSchema,
  fixed: IssuesSchema.describe('Issues that has been fixed previously'),
});

export type Context = z.Infer<typeof ContextSchema>;
export type Issues = z.Infer<typeof IssuesSchema>;
export type Tests = z.Infer<typeof TestsSchema>;
