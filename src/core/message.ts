import { ArgumentsSchema, ToolName } from './tool';
import { Brand, ChildBrand } from '../misc/utils';

export type Message =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | ToolMessage;

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

export type ToolCall = {
  function: {
    name: ToolName;
    arguments: ArgumentsValue;
  };
};

export type AssistantMessage = {
  role: 'assistant';
  content: string;
  tool_calls?: ToolCall[];
};

export type ArgumentsValue = ChildBrand<JSONString, 'ArgumentsValue'>;

type JSONString = Brand<string, 'JSONString'>;
