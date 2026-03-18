import { Message, SystemMessage } from '@lib/llm/types/message-types';

export type ActorMessage = Exclude<Message, SystemMessage>;

export class LLMState {
  static create(system: string) {
    return new LLMState({ system, messages: [] });
  }

  private constructor(private state: { system: string; messages: Message[] }) {}

  advance(...messages: ActorMessage[]) {
    return new LLMState({
      system: this.state.system,
      messages: [...this.state.messages, ...messages],
    });
  }

  toNative(): Message[] {
    return [
      { role: 'system', content: this.state.system },
      ...this.state.messages,
    ];
  }
}
