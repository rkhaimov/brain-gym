import { Brand } from '../../utils/utils';
import { ToolCallChunk } from './tool-types';

export type LLMResponseChunk = { choices: LLMChoiceChunk[] };

type LLMChoiceChunk = {
  delta: {
    content?: AssistantContentChunk;
    tool_calls?: ToolCallChunk[];
  };
};

export type AssistantContentChunk = Brand<string, 'AssistantContentChunk'>;
