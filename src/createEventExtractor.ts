import { z } from 'zod';
import { openai } from './core/llm/openai';
import { LLMResponseChunk } from './core/llm/response-chunk-types';
import { structured, StructuredFailure } from './core/structured';
import { Either } from './utils/Either';
import { Failure } from './utils/Failure';
import { Schema, SchemaParseFailure } from './utils/Schema';
import { Stream } from './utils/Stream';

type EventExtractorResult = Stream<
  LLMResponseChunk,
  Either<EventExtractorFailure, z.Infer<typeof EVENT_STRICT_SCHEMA>>
>;

type EventExtractorFailure =
  | StructuredFailure
  | EventQueryFailure
  | SchemaParseFailure;

export const createEventExtractor = async function* ({
  query,
}: z.Infer<typeof EVENT_QUERY_SCHEMA>): EventExtractorResult {
  const result = yield* structured(
    [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: query,
      },
    ],
    {
      llm: openai,
      schema: EVENT_PARTIAL_SCHEMA,
    },
  );

  if (Either.isLeft(result)) {
    return result;
  }

  if (Either.isLeft(result.value)) {
    return result.value;
  }

  return Schema.parse(EVENT_STRICT_SCHEMA, result.value.value);
};

const SYSTEM_PROMPT = `
You are an AI assistant who is responsible for extracting information about an event from user query.

Current date is ${new Date().toDateString()} ${new Date().toTimeString()}

# Rules

* User always operates in current timezone time.
* Parsed date MUST be in ISO format with UTC offset.

<example>
User - "Schedule a mitting on 10 march at 10:00"
Agent - "Okay, I must extract date in ISO format with UTC, since current UTC is +03:00 the end result would be 2026-03-10T07:00:00Z"
</example>

* When user query is not clearly about arranging a single event you MUST return 'failure' case.

<example>
User - "The sun outside is bright"
Agent - "Okay, this is not an event arrangment, so I will return 'failure' with a "Not an event arrangment" reason"
</example>

<example>
User - "Arrange a mitting at 11:00 and after that on 13:00"
Agent - "Okay, query contains several arrangments, but I can only parse one, so I will return 'failure' with a "Too many arrangment requests. Can accepty only one" reason"
</example>

* When you think something required for event arrangment is missing just omited it. Do not return 'failure' case.

<example>
User - "Arrange a mitting at 11:00. Invite john@mail.com"
Agent - "Hmm, duration is missing, so I will not include it in final response"
</example>

* Even duration is measured in minutes.

<example>
User - "Arrange a mitting at 11:00 til 12:00"
Agent - "Okay, this event is last for 1 hour so duration would be 60 (minutes)"
</example>
`;

type EventQueryFailure = z.Infer<typeof EVENT_QUERY_FAILURE_SCHEMA>;

const EVENT_QUERY_FAILURE_SCHEMA = Failure.asSchema(
  'EventQueryFailure',
  z.string().describe('Human-readable parse failure'),
);

const EVENT_PARTIAL_SCHEMA = Either.asSchema(
  EVENT_QUERY_FAILURE_SCHEMA,
  z.object({
    type: z.literal('success'),
    title: z.string().optional(),
    startsAt: z.string().optional().describe('ISO date'),
    duration: z
      .number()
      .optional()
      .describe('Duration in minutes, must be positive non-zero integer'),
    attendees: z
      .array(z.string().describe('Email'))
      .optional()
      .describe('List of attendees, must not be empty'),
  }),
);

export const EVENT_QUERY_SCHEMA = z.object({
  query: z.string().describe('Query to try parse event arrangement from'),
});

const EVENT_STRICT_SCHEMA = z.object({
  title: z.string(),
  startsAt: z.iso.datetime(),
  duration: z.int().positive(),
  attendees: z.array(z.email()).min(1),
});
