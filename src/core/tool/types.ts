import { Either } from '../../utils/Either';
import { Failure } from '../../utils/Failure';
import { Stream } from '../../utils/Stream';
import { LLMResponseChunk } from '../llm/response-chunk-types';
import { ToolArguments, ToolMessage, ToolMeta } from '../llm/tool-types';

export type Tool = {
  meta: ToolMeta;
  run(args: ToolArguments): ToolResult;
};

export type ToolResult = Stream<
  LLMResponseChunk,
  Either<ToolFailure, ToolMessage>
>;

export type ToolFailure = Failure<'ToolCallFailure', unknown>;
