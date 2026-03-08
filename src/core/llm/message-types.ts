import { ToolCall, ToolMessage } from './tool-types';

export type Message =
  | SystemMessage
  | UserMessage
  | ToolMessage
  | AssistantMessage;

export type SystemMessage = {
  role: 'system';
  content: string;
};

export type UserMessage = {
  role: 'user';
  content: string;
};

export type AssistantMessage = {
  role: 'assistant';
  content: string;
  tool_calls: ToolCall[];
};
