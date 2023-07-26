act0((a: boolean, b: string, c: {}) => 1);

function act0(input: Function) {}

act1((a: number) => 1);
act1((a: true) => 'awdaw');
act1((a: false) => ({ name: 'Vasiliy' }));
act1((a: string) => () => 0);

function act1(input: (a: never) => unknown) {
  const t = input();

  t;

  t as number;
}

// unknown = 0 | 1 | 2 | ... | 'hello' | ... | { name: 'Vasiliy' } | ...
// never = 0 & 1 & 2 & ... & 'hello' & ... & { name: 'Vasiliy' } & ...

type ExcludeUndefined<T> = T extends undefined ? never : T;

type R0 = ExcludeUndefined<1 | 2 | undefined>;

type HasUndefined<T> = undefined extends T ? true : false;

type R1 = HasUndefined<1 | 2 | undefined>;

type CovariantCompiles<A, B> = A extends B ? true : false;

const r: string | number = 1 as number;

type R2 = CovariantCompiles<number, string | number>;

type ContravariantCompiles<A, B> = B extends A ? true : unknown;

type R3 = ContravariantCompiles<number | string, number>;

function act2(
  input: (input: number | string) => true
): (input: number) => true {
  return input;
}

type A<T> = T extends { name: string } ? T : { name: number };

declare const n: A<unknown>;

function act3<T extends { name: string }>(a: A<T>) {
  a.name;
}

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

type ExtractWithPagingContent<T> = T extends WithPaging<unknown> ? T['content'][number] : never;

type R8 = ExtractWithPagingContent<typeof t0>;
type R9 = ExtractWithPagingContent<typeof t1>;

type EditableBox<in T> = {
  edit(value: T): void;
}

type IsEditableBox<T> = T extends EditableBox<never> ? true : false;

declare const t2: EditableBox<number>;
declare const t3: number;

type R10 = IsEditableBox<typeof t2>;
type R11 = IsEditableBox<typeof t3>;

type AsNumber<T> = T extends number ? T : never;

type ToPrecisionType<T> = AsNumber<T>['toPrecision'];
