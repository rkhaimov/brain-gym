import { Either } from '../../utils/Either';
import { ToolArguments, ToolMessage, ToolMeta } from '../llm/types/tool-types';

export type Tool<TReturn> = {
  meta: ToolMeta;
  run(args: ToolArguments): TReturn;
};

export type ToolFn<TArgs, TReturn> = (
  args: Either<ToolMessage, TArgs>,
  context: ToolContext,
) => TReturn;

export type ToolContext = {
  args: ToolArguments;
  meta: ToolMeta;
};
