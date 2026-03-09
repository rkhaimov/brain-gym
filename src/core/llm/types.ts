import { Either } from '../../utils/Either';
import { Failure } from '../../utils/Failure';
import { Stream } from '../../utils/Stream';
import { JSONSchema } from '../../utils/Schema';
import { Message } from './message-types';
import { LLMResponseChunk } from './response-chunk-types';
import { ToolMeta } from './tool-types';

export type LLM = (body: LLMBody) => LLMResponse;

type LLMBody = {
  tools: ToolMeta[];
  messages: Message[];
  response_format?: ResponseFormat;
};

export type LLMResponse = Stream<LLMResponseChunk, Either<LLMFailure, void>>;
export type LLMFailure = Failure<'LLMFailure', unknown>;

type ResponseFormat = {
  type: 'json_schema';
  json_schema: {
    name: 'extract';
    strict: true;
    schema: JSONSchema;
  };
};
