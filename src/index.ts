import { llm } from '@lib/llm/llm';
import { structured } from '@lib/llm/structured';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { LLMState } from '@lib/LLMState';
import { render } from '@lib/render';
import { Either } from '@utils/Either';
import { isDefined } from '@utils/guards';
import { Stream } from '@utils/Stream';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

async function main() {
  return render(run());
}

async function* run(): Stream<LLMResponseChunk, unknown> {
  const docs = fs.globSync(['./docs/**/*.md', './docs/**/*.mdx']).sort();

  for (const doc of docs.slice(0, 60)) {
    const endPath = path.join(process.cwd(), 'translated', doc);

    if (fs.existsSync(endPath)) {
      continue;
    }

    console.log('Translating', doc);

    const result = yield* structured({
      messages: LLMState.create(
        fs.readFileSync(path.join(__dirname, 'system-prompt.md')).toString(),
      )
        .advance({
          role: 'user',
          content: fs.readFileSync(path.join(process.cwd(), doc)).toString(),
        })
        .toNative(),
      llm: llm.fast,
      schema: z.object({
        content: z.string().describe('Translated md/mdx content'),
      }),
    });

    if (Either.isRight(result)) {
      fs.mkdirSync(path.dirname(endPath), { recursive: true });
      fs.writeFileSync(endPath, result.value.content);
    }
  }

  return 0;
}

void main();
