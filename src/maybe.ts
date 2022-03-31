type Some<TA> = { tag: 'some'; value: TA };
type None = { tag: 'none' };

export class Maybe<TA> {
  static some = <TA>(value: TA): Maybe<TA> =>
    new Maybe<TA>({ tag: 'some', value });

  static none = <TA>(): Maybe<TA> => new Maybe<TA>({ tag: 'none' });

  static fromNullable = <TA>(value: TA | null | undefined): Maybe<TA> => {
    if (value === null || value === undefined) {
      return Maybe.none();
    }

    return Maybe.some(value);
  };

  constructor(private container: Some<TA> | None) {}

  map = <TB>(transform: (value: TA) => TB): Maybe<TB> => {
    return this.flatMap((value) => Maybe.some(transform(value)));
  };

  flatMap = <TB>(transform: (value: TA) => Maybe<TB>): Maybe<TB> => {
    if (this.container.tag === 'none') {
      return Maybe.none();
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
