import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { Stream } from '@utils/Stream';
import { isDefined } from '@utils/guards';

export async function render(stream: Stream<LLMResponseChunk, unknown>) {
  let thinking = false;

  while (true) {
    const chunk = await stream.next();

    if (chunk.done) {
      return console.log('\n\nDONE', chunk.value);
    }

    const message = chunk.value;
    const reasoning = message.choices[0]?.delta.reasoning;

    if (isDefined(reasoning)) {
      if (!thinking) {
        console.log('\n\n### Reasoning START ###\n');

        thinking = true;
      }

      process.stdout.write(reasoning);

      continue;
    }

    if (thinking) {
      console.log('\n\n### Reasoning END ###\n');

      thinking = false;
    }

    const content = message.choices[0]?.delta.content;

    if (isDefined(content)) {
      process.stdout.write(content);
    }
  }
}
