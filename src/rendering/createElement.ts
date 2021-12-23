import { combineLatest, map, Observable, Observer, of } from 'rxjs';
import { flatten } from 'lodash-es';
import { VirtualElement } from '../../global';

export function createElement(
  type: string,
  _props: Record<string, Observable<string> | (() => unknown)> | null,
  ...children: Children
): JSX.Element {
  const props = _props ?? {};

  const events = Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith('on'))
  );

  return combineLatest([createChildren(), createAttributes()]).pipe(
    map(([children, attributes]) => ({
      type,
      attributes: { ...Object.fromEntries(attributes), ...events },
      children,
    }))
  );

  function createAttributes(): Observable<[string, string][]> {
    const attributes: Array<Observable<[string, string]>> = Object.entries(
      props
    )
      .filter(([key]) => key.startsWith('on') === false)
      .map(([key, value]) =>
        (value as Observable<string>).pipe(
          map((received) => [key === 'className' ? 'class' : key, received])
        )
      );

    if (attributes.length === 0) {
      return of([]);
    }

    return combineLatest(attributes);
  }

  function createChildren(): Observable<VirtualElement[]> {
    const filtered = children.filter((child) =>
      Array.isArray(child) ? child.length !== 0 : true
    );

    if (filtered.length === 0) {
      return of([]);
    }

    const converted = flatten(children).map((child) =>
      typeof child === 'string' ? of(child) : child
    ) as Array<Observable<VirtualElement>>;

    return combineLatest(converted);
  }
}

type Props<TData extends Record<string, unknown> = {}> = {
  [key in keyof TData]: TData[key] extends undefined
    ? Observable<NonNullable<TData[key]>> | undefined
    : Observable<TData[key]>;
} & {
  children: Observable<VirtualElement>[];
};

export function createMappingCallback<TValue, TObserved>(
  observer: Pick<Observer<TObserved>, 'next'>,
  map: (e: TValue) => TObserved
) {
  return (e: TValue) => observer.next(map(e));
}

export function createIdentityCallback(observer: Pick<Observer<void>, 'next'>) {
  return () => observer.next();
}

export function createClosureCallback<TClosure extends object>(
  observer: Pick<Observer<TClosure>, 'next'>,
  closure: TClosure
) {
  return () => observer.next(closure);
}

type Children = Array<Observable<VirtualElement> | string | Children>;
