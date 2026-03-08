import { LLMResponseChunk } from './core/llm/response-chunk-types';
import { RStream } from './utils/RStream';
import { isDefined } from './utils/utils';

export async function render(stream: RStream<LLMResponseChunk, unknown>) {
  let thinking = false;

  while (true) {
    const chunk = await stream.next();

    if (chunk.done) {
      return console.log('\nDONE', chunk.value);
    }

    const reasoning = chunk.value.choices[0]?.delta.reasoning;

    if (isDefined(reasoning)) {
      if (!thinking) {
        console.log('### Reasoning START ###');

        thinking = true;
      }

      process.stdout.write(reasoning);

      continue;
    }

    if (thinking) {
      console.log('### Reasoning END ###');

      thinking = false;
    }

    const content = chunk.value.choices[0]?.delta.content;

    if (isDefined(content)) {
      process.stdout.write(content);
    }
  }
}
