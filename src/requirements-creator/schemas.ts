import { z } from 'zod';
import { ConversationSchema } from '../Conversation';

const StepsSchema = z
  .array(
    z.object({
      actor: z.enum(['user', 'system']),
      action: z.string().describe('An action performed by an actor'),
    }),
  )
  .describe("A step-by-step list of the user's and system's actions");

export const RequirementsSchema = z.object({
  title: z.string().describe('A short, descriptive name.'),
  description: z
    .string()
    .describe('A brief, high-level summary of the feature.'),
  preconditions: z.object({
    api: z
      .object({
        command: z
          .string()
          .describe('Command name to run a program. (e.g., `greeter`)'),
        args: z
          .array(
            z.discriminatedUnion('type', [
              z.object({ type: z.literal('flag'), name: z.string() }),
              z.object({ type: z.literal('named'), name: z.string() }),
              z.object({
                type: z.literal('positional'),
                placeholder: z.string(),
              }),
            ]),
          )
          .describe(
            'Command arguments contained in argv. Each argument type is always a string (a program have to parse it manually and handle possible edge cases.)',
          ),
      })
      .describe('Shell level API'),
    conditions: z
      .array(z.string())
      .describe('What must be true before this function can be executed?'),
  }),
  postconditions: z
    .array(z.string())
    .describe(
      'What is the state of the system after the function is successfully executed?',
    ),
  mainFlow: StepsSchema,
  alternativeFlow: z
    .array(
      z.object({
        title: z.string().describe("Case's short title"),
        steps: StepsSchema,
      }),
    )
    .describe('Slightly different paths that still lead to success.'),
  exceptionFlows: z
    .array(
      z.object({
        title: z.string().describe("Case's short title"),
        steps: StepsSchema,
      }),
    )
    .describe('What happens when things go wrong? (e.g., wrong input).'),
});

export const IssuesSchema = z.array(
  z.object({
    title: z.string().describe('Short title'),
    where: z
      .array(
        z.union([
          z.string().describe('Property name'),
          z.number().describe('Index (for array types)'),
        ]),
      )
      .describe('Property path to issue location'),
    problem: z.string().describe('What is wrong'),
  }),
);

export const ContextSchema = z.object({
  conversation: ConversationSchema,
  requirements: RequirementsSchema,
  fixed: IssuesSchema.describe('Issues that has been fixed previously'),
});

export type Context = z.Infer<typeof ContextSchema>;
export type Issues = z.Infer<typeof IssuesSchema>;
export type Requirements = z.Infer<typeof RequirementsSchema>;
