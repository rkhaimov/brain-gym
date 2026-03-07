import { JSONSchema, JSONString } from '../../utils/schema';
import { Brand, ExtendsBrand } from '../../utils/utils';

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
  id: ToolCallID;
  type: 'function';
  function: {
    name: ToolName;
    arguments: ToolArguments;
  };
};

export type ToolCallID = Brand<string, 'ToolCallID'>;
export type ToolName = Brand<string, 'ToolName'>;
export type ToolArguments = ExtendsBrand<JSONString, 'ToolArguments'>;

export type ToolCallChunk = {
  index: number;
  function: {
    name?: ToolName;
    arguments?: ToolArgumentsChunk;
  };
};

export type ToolArgumentsChunk = Brand<string, 'ToolArgumentsChunk'>;
