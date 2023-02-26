enum Colors {
  red = 'red',
  blue = 'blue',
  green = 'green',
}

c(Colors.red);

function c(cc: Colors) {
}

// Add two is polymorphic function working on infinite possibilities of n
function addTwo(n: number) {
  return n + 2;
}

addTwo(2);

addTwo(3);

addTwo(10);

addTwo(202);

// There is no explicit type for TType
type Nullable<TType> = TType | undefined;

type T0 = Nullable<number>;
type T1 = Nullable<string>;
type T2 = Nullable<boolean>;

function onGeneric<T, E>(value: T, other: E) {
  let n: number = 2;

  n = value;

  value = n;

  other = value;

  value = value;
}

function onGeneric0<T>(value: T) {
  if (onGeneric) {
    return value;
  }
}

const val = onGeneric0(2);

function addTwo2(n: number) {
  return n + 2;
}

function onGenerics3<T, E extends T>(value: T, other: E) {
  value = other;
}

// Contravariance (narrow to wider)
type Reader<out T> = {
  get(): T;
}

function contravariance(value: Reader<{ name: string }>) {
  const v: Reader<{}> = value;

  v.get();
}

type Writer<in T> = {
  set(value: T): void;
};

function covariance(value: Writer<{ name: string }>) {
  const v: Writer<{ name: string, surname: string }> = value;

  v.set({name: '', surname: ''})
}

covariance({
  set(value) {
    value.name;
  }
});

type ReadWrite<in out T> = {
  set(value: T): void;
  get(): T;
};

function invariance(rw: ReadWrite<{ name: string }>) {
  const value: ReadWrite<{ name: string }> = rw;
}

type SelectProps<in out TOption> = {
  onChange(option: TOption): void;
  options: TOption[];
};

function FancySelect<TOption extends { label: string; value: unknown; }>(props: SelectProps<TOption>) {
  props.options[0].value
}

FancySelect<{ label: string, value: unknown, flag: boolean }>({onChange(option) {
    option;
  }});

// number string
// brands using classes and tags
// | &
// value assignment
// type assertions
// struct type
// literal types
// void
// unknown
// never
// generics
// constraints
// in out
// type narrowing
// mapped types
