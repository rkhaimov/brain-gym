import { AssistantMessage } from '@lib/llm/types/message-types';
import { ToolCall, ToolMessage } from '@lib/llm/types/tool-types';
import { ActorMessage, LLMState } from '@lib/LLMState';
import { FeedbackTool, Tool } from '@lib/tool/types';
import { Either } from '@utils/Either';
import { isDefined } from '@utils/guards';

export async function runTools<TReturn>(
  state: LLMState,
  message: AssistantMessage,
  finalize: Tool<TReturn>,
  feedback: FeedbackTool[],
): Promise<Result<TReturn>> {
  if (message.tool_calls.length === 0) {
    return tryRunFinalizeFromContent(state, message.content, finalize);
  }

  const found = message.tool_calls.find(
    (it) => it.function.name === finalize.meta.function.name,
  );

  if (found) {
    return runFinalize(state, message, finalize, found);
  }

  return runFeedbackCalls(state, message, finalize, feedback);
}

function tryRunFinalizeFromContent<TReturn>(
  state: LLMState,
  content: string,
  finalize: Tool<TReturn>,
): Result<TReturn> {
  const jsonMD = content.match(/^```json([\s\S]*?)```$/);

  if (jsonMD && isDefined(jsonMD[1])) {
    return tryRunFinalizeFromContent(state, jsonMD[1].trim(), finalize);
  }

  const syntheticCall: ToolCall = {
    type: 'function',
    id: `${Date.now()}`,
    function: {
      name: finalize.meta.function.name,
      arguments: content,
    },
  };

  const args = createToolArguments(syntheticCall, finalize);

  if (Either.isLeft(args)) {
    return {
      type: 'feedback',
      value: [
        {
          role: 'developer',
          content: 'You must call \`finalize\` tool to finish',
        },
      ],
    };
  }

  return {
    type: 'end',
    value: finalize.run(args.value, { call: syntheticCall, state }),
  };
}

function runFinalize<TReturn>(
  state: LLMState,
  message: AssistantMessage,
  finalize: Tool<TReturn>,
  call: ToolCall,
): Result<TReturn> {
  if (message.tool_calls.length > 1) {
    return {
      type: 'feedback',
      value: [
        {
          role: 'developer',
          content: `${finalize.meta.function.name} must be called with no other tool calls`,
        },
      ],
    };
  }

  const args = createToolArguments(call, finalize);

  if (Either.isLeft(args)) {
    return {
      type: 'feedback',
      value: [args.value],
    };
  }

  return {
    type: 'end',
    value: finalize.run(args.value, { call, state }),
  };
}

async function runFeedbackCalls(
  state: LLMState,
  message: AssistantMessage,
  end: UnknownTool,
  feedback: FeedbackTool[],
): Promise<FeedbackResult> {
  const resolvedCalls = resolveFeedbackCalls(message, end, feedback);

  if (Either.isLeft(resolvedCalls)) {
    return {
      type: 'feedback',
      value: [resolvedCalls.value],
    };
  }

  const parsedCalls = parseFeedbackCalls(resolvedCalls.value);

  if (Either.isLeft(parsedCalls)) {
    return {
      type: 'feedback',
      value: parsedCalls.value,
    };
  }

  return {
    type: 'feedback',
    value: await runParsedFeedbackCalls(state, parsedCalls.value),
  };
}

function resolveFeedbackCalls(
  message: AssistantMessage,
  end: UnknownTool,
  feedback: FeedbackTool[],
): Either<ActorMessage, ResolvedFeedbackCall[]> {
  const missingTools: string[] = [];
  const resolvedCalls: ResolvedFeedbackCall[] = [];

  for (const call of message.tool_calls) {
    const tool = feedback.find(
      (it) => it.meta.function.name === call.function.name,
    );

    if (tool) {
      resolvedCalls.push({ call, tool });
    } else {
      missingTools.push(call.function.name);
    }
  }

  if (missingTools.length > 0) {
    const definedTools = [
      end.meta.function.name,
      ...feedback.map((tool) => tool.meta.function.name),
    ];

    return Either.left({
      role: 'developer',
      content: `Requested tools do not exist: ${missingTools.join(', ')}. Defined tools: ${definedTools.join(', ')}`,
    });
  }

  return Either.right(resolvedCalls);
}

type Result<TReturn> = { type: 'end'; value: TReturn } | FeedbackResult;
type FeedbackResult = { type: 'feedback'; value: ActorMessage[] };
type UnknownTool = Tool<unknown>;

function parseFeedbackCalls(
  resolvedCalls: ResolvedFeedbackCall[],
): Either<ToolMessage[], ParsedFeedbackCall[]> {
  const parseErrors: ToolMessage[] = [];
  const parsedCalls: ParsedFeedbackCall[] = [];

  for (const item of resolvedCalls) {
    const parsed = createToolArguments(item.call, item.tool);

    if (Either.isLeft(parsed)) {
      parseErrors.push(parsed.value);
      continue;
    }

    parsedCalls.push({
      call: item.call,
      tool: item.tool,
      args: parsed.value,
    });
  }

  if (parseErrors.length > 0) {
    return Either.left(parseErrors);
  }

  return Either.right(parsedCalls);
}

async function runParsedFeedbackCalls(
  state: LLMState,
  parsedCalls: ParsedFeedbackCall[],
): Promise<ActorMessage[]> {
  const output: ActorMessage[] = [];

  for (const item of parsedCalls) {
    output.push(await item.tool.run(item.args, { call: item.call, state }));
  }

  return output;
}

function createToolArguments(
  call: ToolCall,
  tool: UnknownTool,
): Either<ToolMessage, unknown> {
  try {
    return Either.right(tool.schema.parse(JSON.parse(call.function.arguments)));
  } catch (error: unknown) {
    return Either.left({
      role: 'tool',
      name: tool.meta.function.name,
      content: `Arguments parsing error, correct your mistakes ${error instanceof Error ? error.message : `${error}`}`,
    });
  }
}

type ResolvedFeedbackCall = {
  call: ToolCall;
  tool: FeedbackTool;
};

type ParsedFeedbackCall = {
  call: ToolCall;
  tool: FeedbackTool;
  args: unknown;
};
