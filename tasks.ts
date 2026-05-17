class EventEmitter<TEvents extends Record<string, unknown>> {
  // `any` is on purpose here to avoid unnecessary type-casts and maintain strong public interface
  private listeners = new Map<keyof TEvents, Set<(arg: any) => void>>();

  on<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: (value: TEvents[TEvent]) => void,
  ) {
    const listeners = this.listeners.get(event);

    if (listeners === undefined) {
      this.listeners.set(event, new Set([listener]));
    } else {
      listeners.add(listener);
    }
  }

  off<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: (value: TEvents[TEvent]) => void,
  ) {
    this.listeners.get(event)?.delete(listener);
  }

  once<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: (value: TEvents[TEvent]) => void,
  ) {
    const once = (data: TEvents[TEvent]) => {
      try {
        listener(data);
      } finally {
        this.off(event, once);
      }
    };

    this.on(event, once);
  }

  emit<TEvent extends keyof TEvents>(
    event: TEvent,
    arg: TEvents[TEvent],
  ): void {
    const listeners = this.listeners.get(event);

    if (listeners === undefined) {
      return;
    }

    for (const listener of listeners) {
      listener(arg);
    }
  }
}
