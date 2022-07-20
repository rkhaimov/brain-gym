import { SimpleChanges } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Hook } from './ComposableComponent';
import { useObservable } from './useObservable';

export const useChangesEffect = <TElement, TProp extends keyof TElement>(
  factory: (changes$: Observable<TElement[TProp]>) => Observable<unknown>,
  element: TElement,
  on: TProp
): Hook => {
  const values = new ReplaySubject<TElement[TProp]>(1);

  return {
    ngOnChanges: (changes: SimpleChanges) => {
      if (on in changes) {
        values.next(changes[on as keyof SimpleChanges].currentValue);
      }
    },
    ...useObservable(() => factory(values)),
  };
};
