type Tokenize<T extends string> = FromPointProps<ReplaceIndex<T>>;

type FromPointProps<TProps extends string> = TProps extends `${infer RProp}.${infer ROther}`
  ? [MaybeNumber<RProp>, ...FromPointProps<ROther>]
  : [MaybeNumber<TProps>];

type ReplaceIndex<T extends string> = T extends `${infer RPrefix}[${infer RProp}]${infer RSuffix}`
  ? ReplaceIndex<RPrefix extends '' ? `${RProp}${RSuffix}` : `${RPrefix}.${RProp}${RSuffix}`>
  : T;

type MaybeNumber<T extends string> = T extends `${infer RN extends number}` ? RN : T;

type GetByQuery<T, K extends Array<string | number>> = K extends []
  ? T
  : K extends [infer RProp extends keyof T, ...infer TRest extends Array<string | number>]
    ? GetByQuery<T[RProp], TRest>
    : never;
