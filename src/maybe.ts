type None = { none: null };
type Some<TValue> = { some: TValue };

export type Maybe<TValue> = None | Some<TValue>;

const isNone = (m: Maybe<unknown>): m is None => 'none' in m;

export const map =
  <TInput, TResult>(t: (value: TInput) => TResult) =>
  (m: Maybe<TInput>): Maybe<TResult> => {
    if (isNone(m)) {
      return m;
    }

    return some(t(m.some));
  };

export const flatMap =
  <TInput, TResult>(t: (value: TInput) => Maybe<TResult>) =>
  (m: Maybe<TInput>): Maybe<TResult> => {
    if (isNone(m)) {
      return m;
    }

    return t(m.some);
  };

export const fold =
  <TInput, TResult>(onNone: TResult) =>
  (onSome: (value: TInput) => TResult) =>
  (m: Maybe<TInput>): TResult => {
    if (isNone(m)) {
      return onNone;
    }

    return onSome(m.some);
  };

export const none = (): None => ({ none: null });

export const some = <TValue>(value: TValue): Some<TValue> => ({ some: value });
