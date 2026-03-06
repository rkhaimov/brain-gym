import { Brand, ExtendsBrand } from '../misc/utils';

export type Message =
  | SystemMessage
  | UserMessage
  | ToolMessage
  | AssistantMessage;

export type ToolMeta = {
  function: {
    name: ToolName;
    description: string;
    parameters: ArgumentsSchema;
  };
};

export type SystemMessage = {
  role: 'system';
  content: string;
};

export type UserMessage = {
  role: 'user';
  content: string;
};

export type ToolMessage = {
  role: 'tool';
  content: string;
  name: ToolName;
};

export type AssistantMessage = {
  role: 'assistant';
  content: AssistantContent;
  tool_calls: ToolCall[];
};

export type ToolCall = {
  id: ToolCallID;
  type: 'function';
  function: {
    name: ToolName;
    arguments: ToolArguments;
  };
};

export type ToolArguments = ExtendsBrand<JSONString, 'ToolArguments'>;

type JSONString = Brand<string, 'JSONString'>;

export type AssistantContent = Brand<string, 'AssistantContent'>;
export type ArgumentsSchema = Brand<unknown, 'ArgumentsSchema'>;
export type ToolName = Brand<string, 'ToolName'>;
export type ToolCallID = Brand<string, 'UniqueID'>;
