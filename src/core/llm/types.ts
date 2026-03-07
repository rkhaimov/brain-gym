import { Either } from '../../utils/Either';
import { Failure } from '../../utils/Failure';
import { RStream } from '../../utils/RStream';
import { JSONSchema } from '../../utils/schema';
import { Message } from './message-types';
import { LLMResponseChunk } from './response-chunk-types';
import { ToolMeta } from './tool-types';

export type LLM = (body: LLMBody) => LLMResponse;

type LLMBody = {
  tools: ToolMeta[];
  messages: Message[];
  response_format?: ResponseFormat;
};

export type LLMResponse = RStream<LLMResponseChunk, Either<LLMFailure, void>>;
export type LLMFailure = Failure<'LLMRequestFailure', unknown>;

type ResponseFormat = {
  type: 'json_schema';
  json_schema: {
    name: 'extract';
    strict: true;
    schema: JSONSchema;
  };
};
