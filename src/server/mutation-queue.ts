import { Mutex } from 'async-mutex';

export class MutationQueue {
  readonly #mutex = new Mutex();

  run<T>(mutation: () => Promise<T>): Promise<T> {
    return this.#mutex.runExclusive(mutation);
  }
}
