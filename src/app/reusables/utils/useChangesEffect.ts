import { SimpleChanges } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { createHook, Hook, joinHooks } from './ComposableComponent';
import { useObservable } from './useObservable';

export const useChangesEffect = <TElement, TProp extends Array<keyof TElement>>(
  factory: (
    changes$: Observable<{ [I in keyof TProp]: TElement[TProp[I]] }>
  ) => Observable<unknown>,
  element: TElement,
  on: [...TProp]
): Hook => {
  const changes = on.map((property) => useSingleChange(element, property));

  return joinHooks(
    changes.map(([, hook]) => hook).reduce(joinHooks),
    useObservable(() =>
      factory(combineLatest(changes.map(([change$]) => change$)) as never)
    )
  );
};

const useSingleChange = <TElement, TProp extends keyof TElement>(
  element: TElement,
  on: TProp
): [Observable<TElement[TProp]>, Hook] => {
  const values$ = new ReplaySubject<TElement[TProp]>(1);

  return [
    values$,
    createHook({
      ngOnChanges: (changes: SimpleChanges) => {
        if (on in changes) {
          values$.next(changes[on as keyof SimpleChanges].currentValue);
        }
      },
    }),
  ];
};
