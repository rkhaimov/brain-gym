type ContT<A, R> = {
  run(f: (a: A) => R): R;
  map<B>(f: (a: A) => B): ContT<B, R>;
  flatMap<B>(f: (a: A) => ContT<B, R>): ContT<B, R>;
};

function contT<A, R>(f: (next: (a: A) => R) => R): ContT<A, R> {
  return {
    run: (handle) => f(handle),
    map: (transform) => contT((next) => f((a: A) => next(transform(a)))),
    flatMap: (transform) =>
      contT((next) => f((a: A) => transform(a).run(next))),
  };
}

function doubleIntCont(n: number): ContT<number, number> {
  return contT((next) => next(n * 2));
}

function squareIntCont(n: number): ContT<number, number> {
  return contT((next) => next(Math.pow(n, 2)));
}

doubleIntCont(10)
  .flatMap(squareIntCont)
  .map((n) => n * 4)
  .run((result) => {
    console.log(result);

    return result;
  });
