import { Message, SystemMessage } from './llm/types/message-types';

export type ActorMessage = Exclude<Message, SystemMessage>;

export class LLMState {
  static create(system: string) {
    return new LLMState({
      system: { role: 'system', content: system },
      messages: [],
    });
  }

  private constructor(
    private state: { system: SystemMessage; messages: ActorMessage[] },
  ) {}

  clone(system: string) {
    return new LLMState({
      system: { role: 'system', content: system },
      messages: this.state.messages,
    });
  }

  advance(...messages: ActorMessage[]) {
    return new LLMState({
      system: this.state.system,
      messages: [...this.state.messages, ...messages],
    });
  }

  toHistory() {
    return [this.state.system, ...this.state.messages];
  }
}
