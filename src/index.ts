import { z } from 'zod';
import { openai } from './core/llm/openai';
import { structured } from './core/structured';
import { Schema } from './utils/schema';

async function main() {
  const result = await structured(
    [
      {
        role: 'user',
        content: 'Parse following: My name is John and my ID is 10',
      },
    ],
    {
      llm: openai,
      schema: Schema.create(z.object({ name: z.string(), id: z.number() })),
    },
  );

  console.log(result.value);
}

void main();
