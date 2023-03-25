type UnboxArray<T> = T extends Array<infer R> ? R : never;

declare const t0: UnboxArray<number[][]>

type UnboxArrayDeep<T extends Array<unknown>> = T extends Array<infer R>
  ?
  R extends Array<unknown>
    ? UnboxArrayDeep<R>
    : R
  : never;

declare const t1: UnboxArrayDeep<number[][][][][][][]>

function flatten<T extends Array<unknown>>(list: T): UnboxArrayDeep<T> {
  return list.flatMap((it) => Array.isArray(it) ? flatten(it) : it) as UnboxArrayDeep<T>;
}

const t2 = flatten([1, 2, 3, [5, 6, [7]]]);

type F = ReturnType<() => number>

function toValueOrNone<T extends Record<string, unknown>>(collection: T) {
  const entries = Object.entries(collection).map(([key, value]) => [key, value === undefined ? 'none' : value]);

  return Object.fromEntries(entries);
}

type User = {
  name: string;
  surname: string | undefined;
  age: number;
};

type ToValueOrNone0<T extends Record<string, unknown>> = T;

declare const t3: ToValueOrNone0<User>;

type ToValueOrNone1<T extends Record<string, unknown>> = keyof T;

declare const t4: ToValueOrNone1<User>;

declare const t5: User['age' | 'name'];

declare const t6: User[keyof User];

type ToValueOrNone2<T extends Record<string, unknown>> = {
  [TKey in keyof T]: undefined extends T[TKey] ? Exclude<T[TKey], undefined> | 'none' : T[TKey];
};

declare const t7: ToValueOrNone2<User>

type MyOmit<TObject, TKeys extends keyof TObject> = {
  [TKey in Exclude<keyof TObject, TKeys>]: TObject[TKey];
};

declare const t8: MyOmit<{ name: string, surname: number }, 'surname'>;

t8;

type ConvertOnHandlers0<S extends string> = Uppercase<S>;

declare const t9: ConvertOnHandlers0<'name' | 'surname' | 'age'>;

type ConvertOnHandlers1<S extends string> = S extends `on${infer RHandler}` ? Lowercase<RHandler> : S;

declare const t10: ConvertOnHandlers1<'name' | 'surname' | 'onClick'>;

type RouteParamsFromTemplate<T extends string> = T extends `${infer RStart}:${infer RParam}/${infer REnd}`
  ? { [TKey in RParam]: string } & RouteParamsFromTemplate<`${RStart}${REnd}`>
  : {};

declare const t11: RouteParamsFromTemplate<'/user/:userId/article/:articleName/'>;

export {}
