import { Brand } from '@utils/Brand';
import { JSONSchema } from 'zod/v4/core/json-schema';

export type ToolMessage = {
  role: 'tool';
  content: string;
  name: ToolName;
};

export type ToolMeta = {
  function: {
    name: ToolName;
    description: string;
    parameters: JSONSchema;
  };
};

export type ToolCall = {
  id: string;
  type: 'function';
  function: {
    name: ToolName;
    arguments: string;
  };
};

export type ToolName = Brand<string, 'ToolName'>;

export type ToolCallChunk = {
  index: number;
  function: {
    name?: ToolName;
    arguments?: string;
  };
};
