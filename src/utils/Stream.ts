export type Stream<TEmit, TReturn> = AsyncGenerator<TEmit, TReturn, void>;

export const Stream = {
  toFold: async function* <TEmit, TReturn>(
    stream: Stream<TEmit, TReturn>,
  ): Stream<TEmit, [TEmit[], TReturn]> {
    const emit: TEmit[] = [];

    while (true) {
      const iter = await stream.next();

      if (iter.done) {
        return [emit, iter.value];
      }

      yield iter.value;

      emit.push(iter.value);
    }
  },
};
