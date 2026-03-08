import { LLMResponseChunk } from './core/llm/response-chunk-types';
import { RStream } from './utils/RStream';
import { isDefined } from './utils/utils';

export async function render(stream: RStream<LLMResponseChunk, unknown>) {
  let state: State = DEFAULT_STATE;

  while (true) {
    const chunk = await stream.next();

    if (chunk.done) {
      return console.log('\nDONE', chunk.value);
    }

    const reasoning = chunk.value.choices[0]?.delta.reasoning;

    if (isDefined(reasoning)) {
      state = state.onReasoning();

      process.stdout.write(reasoning);

      continue;
    }

    const content = chunk.value.choices[0]?.delta.content;

    if (isDefined(content)) {
      state = state.onContent();

      process.stdout.write(content);
    }
  }
}

type State = {
  onReasoning(): State;
  onContent(): State;
};

const DEFAULT_STATE: State = {
  onReasoning: () => {
    console.log('### Reasoning START ###');

    return REASONING_STATE;
  },
  onContent: () => DEFAULT_STATE,
};

const REASONING_STATE: State = {
  onReasoning: () => REASONING_STATE,
  onContent: () => {
    console.log('\n### Reasoning END ###');

    return TERMINATE_STATE;
  },
};

const TERMINATE_STATE: State = {
  onReasoning: () => {
    throw new Error('Must not reason');
  },
  onContent: () => TERMINATE_STATE,
};
