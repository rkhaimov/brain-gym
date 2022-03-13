type Some<TA> = { tag: 'some'; value: TA };
type None = { tag: 'none' };

export class Optional<TA> {
  static some = <TA>(value: TA): Optional<TA> =>
    new Optional<TA>({ tag: 'some', value });

  static none = <TA>(): Optional<TA> => new Optional<TA>({ tag: 'none' });

  constructor(private container: Some<TA> | None) {}

  map = <TB>(transform: (value: TA) => TB): Optional<TB> => {
    return this.flatMap((value) => Optional.some(transform(value)));
  };

  flatMap = <TB>(transform: (value: TA) => Optional<TB>): Optional<TB> => {
    if (this.container.tag === 'none') {
      return Optional.none();
    }

    return transform(this.container.value);
  };

  fold = <TB>(none: () => TB, some: (value: TA) => TB): TB => {
    if (this.container.tag === 'none') {
      return none();
    }

    return some(this.container.value);
  };
}
