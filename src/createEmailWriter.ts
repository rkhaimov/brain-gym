import { z } from 'zod';
import { openai } from './core/llm/openai';
import { LLMResponseChunk } from './core/llm/response-chunk-types';
import { structured, StructuredFailure } from './core/structured';
import { ContextFailure, useUser } from './core/user/UserContext';
import { Either } from './utils/Either';
import { Stream } from './utils/Stream';

type EmailWriterResult = Stream<
  LLMResponseChunk,
  Either<ContextFailure | StructuredFailure, z.Infer<typeof EMAIL_SCHEMA>>
>;

export const createEmailWriter = async function* (
  config: z.Infer<typeof EMAIL_META_SCHEMA>,
): EmailWriterResult {
  const SYSTEM_PROMPT = `
  You are an email assistant.
  
  Current user date is ${new Date().toDateString()} ${new Date().toTimeString()}
  
  # Rules
  
  * Email MUST NOT BE DRAFT.
  * Email must be written in professional style.
  * Email must be written using markdown.
  * Email must not contain invented information, e.g. which is not implied from query.
  * Email must be complete, e.g. ready to be sent.
  
  <example>
  User - "Write an email about invintation to a meeting"
  Agent - "Okay, location is missing, but I can not use placehodlers since email must be complete e.g. not draft, so I will just omit it."  
  </example>
  `;

  const user = useUser();

  if (Either.isLeft(user)) {
    return user;
  }

  return yield* structured(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Write an email from ${user.value.name} ${user.value.email} to ${config.to} about ${config.about}`,
      },
    ],
    {
      llm: openai,
      schema: EMAIL_SCHEMA,
    },
  );
};

export const EMAIL_META_SCHEMA = z.object({
  about: z.string().describe('What this email must be about'),
  to: z.email().describe('Email of an email target'),
});

const EMAIL_SCHEMA = z.object({
  title: z.string(),
  content: z.string(),
});
