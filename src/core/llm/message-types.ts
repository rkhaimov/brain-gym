import { Brand } from '../../utils/utils';
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
  content: AssistantContent;
  tool_calls: ToolCall[];
};

export type AssistantContent = Brand<string, 'AssistantContent'>;
