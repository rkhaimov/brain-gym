type AsyncList<T> = {
  forEach(onElement: (element: T) => void): void;
};

type Map = <A, B>(input: AsyncList<A>, transform: (a: A) => B) => AsyncList<B>;

type Flat = <T>(input: AsyncList<AsyncList<T>>) => AsyncList<T>;

function flatMap<A, B>(
  map: Map,
  flat: Flat,
  input: AsyncList<A>,
  transform: (a: A) => AsyncList<B>
): AsyncList<B> {
  return flat(map(input, transform));
}

console.log(flatMap);

function a(a: AsyncList<any>, b: Map, c: Flat) {}

export {};
