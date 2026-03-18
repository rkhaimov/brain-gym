import { ActorMessage, LLMState } from '@lib/LLMState';
import { z } from 'zod';
import { ToolCall, ToolMeta } from '../llm/types/tool-types';

export type Tool<TReturn> = {
  meta: ToolMeta;
  schema: z.ZodType;
  run(args: unknown, context: ToolContext): TReturn;
};

export type ToolFn<TArgs, TReturn> = (
  args: TArgs,
  context: ToolContext,
) => TReturn;

export type ToolContext = {
  call: ToolCall;
  state: LLMState;
};

export type FeedbackTool = Tool<Awaitable<ActorMessage>>;

type Awaitable<T> = Promise<T> | T;
