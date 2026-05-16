class Queue<T> {
  enqueue(value: T): void {}

  dequeue(): T | undefined {}

  detach(value: T): void {}

  exists(value: T): boolean {}

  get size(): number {}
}

type PendingTask<T> = {
  signal: AbortSignal;
  start: PromiseWithResolvers<void>;
  finish: PromiseWithResolvers<T>;
  handle(signal: AbortSignal): Promise<T>;
};

class TaskPool {
  private queue = new Queue<PendingTask<unknown>>();
  private working = 0;

  constructor(private concurrency: number) {}

  async run<T>(
    handle: (signal: AbortSignal) => Promise<T>,
    signal = new AbortController().signal,
  ): Promise<T> {
    signal.throwIfAborted();

    const pending: PendingTask<unknown> = {
      handle,
      signal,
      start: Promise.withResolvers(),
      finish: Promise.withResolvers(),
    };

    if (this.working < this.concurrency) {
      void this.start(pending);
    } else {
      void this.enqueue(pending);
    }

    return pending.finish.promise as Promise<T>;
  }

  private async enqueue(pending: PendingTask<unknown>) {
    this.queue.enqueue(pending);

    const abort = Promise.withResolvers();

    try {
      pending.signal.addEventListener("abort", abort.resolve);

      const aborted = await Promise.race([
        pending.start.promise.then(() => false),
        abort.promise.then(() => true),
      ]);

      if (aborted) {
        this.queue.detach(pending);

        pending.finish.reject(pending.signal.reason);
      }
    } finally {
      pending.signal.removeEventListener("abort", abort.resolve);
    }
  }

  private async start(pending: PendingTask<unknown>): Promise<void> {
    pending.start.resolve();

    this.working += 1;

    try {
      pending.signal.throwIfAborted();

      const result = await pending.handle(pending.signal);

      pending.finish.resolve(result);
    } catch (error) {
      pending.finish.reject(error);
    } finally {
      this.working -= 1;

      const pending = this.queue.dequeue();

      if (pending) {
        void this.start(pending);
      }
    }
  }
}
