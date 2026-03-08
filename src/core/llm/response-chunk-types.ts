import { ToolCallChunk } from './tool-types';

export type LLMResponseChunk = { choices: LLMChoiceChunk[] };

type LLMChoiceChunk = {
  delta: {
    content?: string;
    reasoning?: string;
    tool_calls?: ToolCallChunk[];
  };
};
