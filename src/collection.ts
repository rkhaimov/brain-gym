import { CollectionOf, Point } from './types';
import { assert, not } from './utils';

export function empty<T>(): CollectionOf<T> {
  return new Map<Point, T>();
}

export function one<T>(point: Point, value: T): CollectionOf<T> {
  return new Map<Point, T>([[point, value]]);
}

export function union<TL, TR>(
  left: CollectionOf<TL>,
  right: CollectionOf<TR>
): CollectionOf<TL | TR> {
  return new Map<Point, TL | TR>([...left.entries(), ...right.entries()]);
}

export function intersection<TL, TR>(
  left: CollectionOf<TL>,
  right: CollectionOf<TR>
): CollectionOf<TL | TR> {
  return new Map<Point, TL | TR>(
    [...left.entries(), ...right.entries()].filter(
      ([point]) => left.has(point) && right.has(point)
    )
  );
}

export function exclude<T>(
  toFilter: CollectionOf<T>,
  fromFilter: CollectionOf<unknown>
): CollectionOf<T> {
  return filter(toFilter, (value, point) => not(fromFilter.has(point)));
}

export function map<T, R>(
  collection: CollectionOf<T>,
  transform: (value: T, point: Point) => R
): CollectionOf<R> {
  return flatMap(collection, (value, point) =>
    one(point, transform(value, point))
  );
}

export function flatMap<T, R>(
  collection: CollectionOf<T>,
  transform: (value: T, point: Point) => CollectionOf<R>
): CollectionOf<R> {
  return [...collection.entries()].reduce(
    (result, [point, value]) => union(result, transform(value, point)),
    empty<R>()
  );
}

export function filter<T>(
  collection: CollectionOf<T>,
  predicate: (value: T, point: Point) => boolean
): CollectionOf<T> {
  return new Map<Point, T>(
    [...collection.entries()].filter(([point, value]) =>
      predicate(value, point)
    )
  );
}

export function lookupMany<T>(
  collection: CollectionOf<T>,
  keys: Set<Point>
): CollectionOf<T> {
  return new Map<Point, T>(
    [...keys.values()]
      .filter((point) => collection.has(point))
      .map((point): [Point, T] => [point, lookupOne(collection, point)])
  );
}

export function lookupOne<T>(collection: CollectionOf<T>, key: Point): T {
  assert(collection.has(key));

  return collection.get(key) as T;
}
