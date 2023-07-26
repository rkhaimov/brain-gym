type A1 =
  | { name: string; role: string }
  | { name?: string; surname: string }
  | { age: number };

type B1 = { name: string };

type R4 = Extract<A1, B1>;

type MyExtract<A, B> = A & B;

type R5 = MyExtract<A1, B1>;

declare let a: A1;
declare let b: B1;
declare let bb: { name: string; role: string };
declare let c: Extract<A1, B1>;
declare let d: MyExtract<A1, B1>;

a = c;
b = c;
bb = c;

a = d;
b = d;
bb = d;

type WithPaging<out T> = {
  content: T[];
  pageSize: number;
  total: number;
};

type IsWithPaging<T> = T extends WithPaging<unknown> ? true : false;

declare const t0: WithPaging<{ name: string }>;
declare const t1: number;

type R6 = IsWithPaging<typeof t0>;
type R7 = IsWithPaging<typeof t1>;

type ExtractWithPagingContent<T> = T extends WithPaging<unknown>
  ? T['content'][number]
  : never;

type R8 = ExtractWithPagingContent<typeof t0>;
type R9 = ExtractWithPagingContent<typeof t1>;

type EditableBox<in out T> = {
  edit(value: T): void;
};

type IsEditableBox<T> = T extends EditableBox<unknown> ? true : false;

declare const t2: EditableBox<number>;
declare const t3: number;

type R10 = IsEditableBox<typeof t2>;
type R11 = IsEditableBox<typeof t3>;

type IsUnaryFunction<T> = T extends (arg: never) => unknown ? true : false;

type R12 = IsUnaryFunction<(input: 'hello') => true>;
type R13 = IsUnaryFunction<() => true>;
type R14 = IsUnaryFunction<(a: number, b: number) => true>;

type AsNumber<T> = T extends number ? T : never;

type ToPrecisionType<T> = AsNumber<T>['toPrecision'];

const t4: any = 'awd' as unknown;

const t5: string = t4;
const t6: number = t4;
const t7: string & number = t4;

type Union = number | string | any;
type Intersection = number & any;

function act0(value: any) {
  value.property.value;
}

type UnboxPaging<T extends WithPaging<unknown>> = T extends WithPaging<infer R>
  ? R
  : never;

type R15 = UnboxPaging<WithPaging<'Hello'>>;
type R16 = UnboxPaging<1>;

type UnboxUnaryArg<T> = T extends (arg: infer RArg) => infer RReturn
  ? [RArg, RReturn]
  : never;

type UnboxWithPagingName<T> = T extends WithPaging<
  infer R extends { name: string }
>
  ? R
  : never;

declare const noArgFunction: (arg: string) => number;
declare const arg: UnboxUnaryArg<typeof noArgFunction>;

type Strings = [string, string];
type Numbers = number[];
type Unbounded = [...Strings, ...Numbers, boolean];

const t8: Unbounded = ['1', '2', 2, 3, 4, true];

declare const tail: <T extends unknown[]>(input: readonly [unknown, ...T]) => T;

const t9 = tail([1, 2, 3] as const);

export {};
