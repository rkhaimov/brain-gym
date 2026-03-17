import { z } from 'zod';
import { openai } from './core/llm/openai';
import { structured, StructuredFailure } from './core/llm/structured';
import { LLMState } from './core/LLMState';
import { Stream } from './utils/Stream';
import { Task } from './utils/Task';

export async function classify(
  query: string,
): Task<StructuredFailure, z.Infer<typeof ClassificationSchema>> {
  const [, result] = await Stream.toPromise(
    structured({
      messages: LLMState.create(SYSTEM_PROMPT)
        .advance({ role: 'user', content: query })
        .toHistory(),
      llm: openai,
      schema: ClassificationSchema,
    }),
  );

  return result;
}

export type Source = z.Infer<typeof SourceSchema>;

const SourceSchema = z.enum(['github', 'slack']);

const ClassificationSchema = z.object({
  classifications: z
    .array(z.object({ source: SourceSchema, query: z.string() }))
    .describe('List of agents to invoke with their targeted sub-questions'),
});

const SYSTEM_PROMPT = `
Analyze this query and determine which knowledge bases to consult.
For each relevant source, generate a targeted sub-question optimized for that source.

Available sources:
- github: Code, API references, implementation details, issues, pull requests
- slack: Team discussions, informal knowledge sharing, recent conversations

Return ONLY the sources that are relevant to the query. Each source should have
a targeted sub-question optimized for that specific knowledge domain.

Example for "How do I authenticate API requests?":
- github: "What authentication code exists? Search for auth middleware, JWT handling"
(slack omitted because it's not relevant for this technical question)
`;
