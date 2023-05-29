const composeWriter =
  <A, B, C>(g: (input: B) => [C, string], f: (input: A) => [B, string]) =>
  (input: A) => {
    const [b, fLog] = f(input);
    const [c, gLog] = g(b);

    return [c, gLog + fLog] as const;
  };
