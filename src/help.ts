type User = {
  name: string;
  role: string;
};

function act(user: keyof User) {
  user;
}

type AbstractRecord = {
  [key: string]: number;
};

function act0(input: AbstractRecord) {
  const value = input['age'];

  value.toPrecision();
}

// act0({}) unsafe

const record0: AbstractRecord = {
  name: 10,
  ['hello']: 12,
  [10]: 30,
};

console.log(record0);

type CombinedRecord = {
  [key: string]: string;
  [key: number]: 'hello' | 'world';
};

const record1: CombinedRecord = {
  ['prop']: 'Hello world',
  [10]: 'hello',
};

const r = record1['prop'];
const k = record1[42];

Object.keys(record1).map((key) => {
  const t = record1[key];

  console.log(t);
});

type UniversalKey = keyof never;

type ConcreteRecord = {
  [TKey in 'hello' | 'world']: TKey;
};

function act1(input: ConcreteRecord) {
  const t = input.hello;
}

type RandomPropertiesToUndefined<TInput extends Record<string, unknown>> = {
  [TKey in keyof TInput]?: TInput[TKey];
};

function randomPropertiesToUndefined<TInput extends Record<string, unknown>>(
  input: TInput
): Partial<TInput> {
  const result = Object.entries(input).map(([key, value]) => [
    key,
    Math.random() > 0.5 ? undefined : value,
  ]);

  return Object.fromEntries(result);
}

const input0 = { name: 'Vladimir', age: 20 };
type Result0 = RandomPropertiesToUndefined<typeof input0>;
const result0 = randomPropertiesToUndefined(input0);

type UserFromApi = {
  name?: string;
  age?: number;
};

type UserMapped = Required<UserFromApi>;

declare function toMappedUser(input: UserFromApi): UserMapped;

declare const n: UserFromApi;

type PickByKeys<
  TInput extends Record<string, unknown>,
  TKeys extends keyof TInput
> = {
  [TKey in TKeys]: TInput[TKey];
};

function pickByKeys<
  TInput extends Record<string, unknown>,
  TKeys extends keyof TInput
>(input: TInput, keys: TKeys[]) {
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => keys.includes(key as TKeys))
  ) as Pick<TInput, TKeys>;
}

const result1 = pickByKeys({ name: 'Hello', age: 30, role: 'admin' }, [
  'name',
  'age',
  'age',
]);

type OmitByKeys<
  TInput extends Record<string, unknown>,
  TKeys extends keyof TInput
> = PickByKeys<TInput, Exclude<keyof TInput, TKeys>>;

function omitByKeys<
  TInput extends Record<string, unknown>,
  TKeys extends keyof TInput
>(input: TInput, keys: TKeys[]) {
  return pickByKeys(
    input,
    Object.keys(input).filter((key) => !keys.includes(key as TKeys))
  ) as OmitByKeys<TInput, TKeys>;
}

console.log(omitByKeys({ name: 'Hello', age: 30, role: 'admin' }, ['name']));

function head<T>(input: readonly T[]) {
  return input[0];
}

const t = head([1, 2, 3] as const);

type IsEmptyList<TInput extends unknown[]> = TInput extends [] ? true : false;

type Result1 = IsEmptyList<[]>;
type Result2 = IsEmptyList<[1]>;
type Result3 = IsEmptyList<[1, 2]>;

type IsOneElementList<TInput extends unknown[]> = TInput extends [unknown]
  ? true
  : false;

type Result4 = IsOneElementList<[]>;
type Result5 = IsOneElementList<[1]>;
type Result6 = IsOneElementList<[1, 2]>;

type IsAtLeastOneElementList<TInput extends unknown[]> = TInput extends [
  unknown,
  ...unknown[]
]
  ? true
  : false;

type Result7 = IsAtLeastOneElementList<[]>;
type Result8 = IsAtLeastOneElementList<[1]>;
type Result9 = IsAtLeastOneElementList<[1, 2]>;

type Head<TInput extends unknown[]> = TInput extends [infer RHead, ...unknown[]]
  ? RHead
  : never;

type Result10 = Head<[1]>;
type Result11 = Head<[1, 2]>;
type Result12 = Head<[]>;

type Tail<TInput extends unknown[]> = TInput extends [unknown, ...infer RTail]
  ? RTail
  : never;

type Result13 = Tail<[1]>;
type Result14 = Tail<[1, 2]>;
type Result15 = Tail<[]>;

type HeadFlat<TInput extends unknown[]> = Head<TInput> extends unknown[]
  ? HeadFlat<Head<TInput>>
  : Head<TInput>;

type Result16 = HeadFlat<[[1, [2, [3]]], 2]>;

type Flat<TInput extends unknown[]> = TInput extends [
  infer RHead,
  ...infer RRest
]
  ? RHead extends unknown[]
    ? [...Flat<RHead>, ...Flat<RRest>]
    : [RHead, ...Flat<RRest>]
  : [];

type Result17 = Flat<[]>;
type Result18 = Flat<[1, 2]>;
type Result19 = Flat<[1, 2, [2, [3, [4]]]]>;

type UnknownStruct = {
  [key: string]: unknown;
};

type DefaultsAnyStructToNumber<TInput extends UnknownStruct> = {
  [TKey in keyof TInput]: undefined extends TInput[TKey]
    ? NonNullable<TInput[TKey]> | number
    : TInput[TKey];
};
