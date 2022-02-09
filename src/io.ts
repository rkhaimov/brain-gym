export class IO<T> {
  private constructor(private effect: () => T) {}

  static of<T>(effect: () => T) {
    return new IO(effect);
  }

  map = <TNext>(transform: (value: T) => TNext): IO<TNext> => {
    return IO.of(() => transform(this.unsafeRun()));
  };

  flatMap = <TNext>(transform: (value: T) => IO<TNext>): IO<TNext> => {
    // TODO: This is wrong
    return transform(this.unsafeRun());
  };

  unsafeRun = (): T => {
    return this.effect();
  };
}
