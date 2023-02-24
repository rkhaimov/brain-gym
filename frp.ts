type Stream<T> = {
  producer(): AsyncGenerator<T, void, void>;
};

function createStream<T>(producer: Stream<T>['producer']): Stream<T> {
  return {producer: producer};
}

async function collectStream<T>(collector: (value: T) => void, stream: Stream<T>) {
  const values = stream.producer()

  for await (const value of values) {
    collector(value);
  }
}

function mapStream<TBefore, TAfter>(transform: (before: TBefore) => TAfter | Promise<TAfter>, stream: Stream<TBefore>) {
  return createStream<TAfter>(async function* () {
    const parent = stream.producer();

    for await (const value of parent) {
      yield transform(value);
    }
  });
}

function delayed<T>(ms: number, stream: Stream<T>) {
  return mapStream(async (it) => {
    await wait(ms);

    return it;
  }, stream);
}

const countToThree$ = createStream(async function* () {
  yield 1;
  yield 2;
  yield 3;
});

collectStream(
  console.log,
  mapStream(async (n) => {
    await wait(1_000);

    return n * 2;
  }, countToThree$),
);

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
