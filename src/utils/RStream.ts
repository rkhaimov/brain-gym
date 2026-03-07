export type RStream<TEmit, TReturn> = AsyncGenerator<TEmit, TReturn, void>;

export const RStream = {
  toPromise: async <TEmit, TReturn>(
    stream: RStream<TEmit, TReturn>,
  ): Promise<[TEmit[], TReturn]> => {
    const emit: TEmit[] = [];

    while (true) {
      const iter = await stream.next();

      if (iter.done) {
        return [emit, iter.value];
      }

      emit.push(iter.value);
    }
  },
};
