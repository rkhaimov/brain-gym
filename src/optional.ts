type Some<T> = { type: 'some'; value: T };
type None = { type: 'none' };

export class Optional<T> {
  private constructor(private content: Some<T> | None) {}

  static fromNullable<T>(value: T | null | undefined): Optional<T> {
    if (value) {
      return Optional.some(value);
    }

    return Optional.none();
  }

  static none<T>() {
    return new Optional<T>({ type: 'none' });
  }

  static some<T>(value: T) {
    return new Optional<T>({ type: 'some', value });
  }

  map = <TNext>(transform: (value: T) => TNext): Optional<TNext> => {
    if (this.content.type === 'none') {
      return Optional.none();
    }

    return Optional.some(transform(this.content.value));
  };

  fold = <TResult>(none: TResult, some: (value: T) => TResult): TResult => {
    if (this.content.type === 'none') {
      return none;
    }

    return some(this.content.value);
  };
}
