import { Either } from '../../../utils/Either';
import { Failure } from '../../../utils/Failure';
import { JSONSchema } from '../../../utils/Schema';
import { Stream } from '../../../utils/Stream';
import { AssistantMessage, Message } from './message-types';
import { LLMResponseChunk } from './response-chunk-types';
import { ToolMeta } from './tool-types';

export type LLM = (body: LLMBody) => LLMResponse;

export type LLMBody = {
  messages: Message[];
  tools?: ToolMeta[];
  response_format?: ResponseFormat;
};

export type LLMResponse = Stream<
  LLMResponseChunk,
  Either<LLMFailure, AssistantMessage>
>;

export type LLMFailure =
  | Failure<'UnknownLLMFailure', unknown>
  | Failure<'LLMBadResponse', string>;

export type ResponseFormat = {
  type: 'json_schema';
  json_schema: {
    name: 'extract';
    strict: true;
    schema: JSONSchema;
  };
};
