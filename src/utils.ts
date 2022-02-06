export const trace =
  (mark: string) =>
  <TValue>(value: TValue): TValue => {
    console.log(mark, value);

    return value;
  };

export const id = <TValue>(value: TValue) => value;
