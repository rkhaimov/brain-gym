import { ToolArguments, ToolMessage, ToolMeta } from '../llm/tool-types';
import { Either } from '../../utils/Either';
import { Failure } from '../../utils/Failure';
import { SchemaParseFailure } from '../../utils/schema';

export type Tool = {
  meta: ToolMeta;
  run(args: ToolArguments): Promise<Either<ToolFailure, ToolMessage>>;
};

export type ToolFailure =
  | SchemaParseFailure
  | Failure<'ToolCallFailure', unknown>;
