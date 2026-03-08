import { Brand } from '../../utils/utils';
import { ToolCallChunk } from './tool-types';

export type LLMResponseChunk = { choices: LLMChoiceChunk[] };

type LLMChoiceChunk = {
  delta: {
    content?: LLMContentChunk;
    reasoning?: LLMReasoningChunk;
    tool_calls?: ToolCallChunk[];
  };
};

export type LLMContentChunk = Brand<string, 'LLMContentChunk'>;
export type LLMReasoningChunk = Brand<string, 'LLMReasoningChunk'>;
