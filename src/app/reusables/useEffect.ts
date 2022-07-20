import { SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ComposableUtils } from './ComposableComponent';
import { useObservable } from './useObservable';

type ComponentType = new (...args: any) => any;

export const useEffect = <
  TElement extends ComponentType,
  TProp extends keyof InstanceType<TElement>
>(
  runEffect: (
    changes$: Observable<InstanceType<TElement>[TProp]>
  ) => Observable<unknown>,
  element: TElement,
  on: TProp
): ComposableUtils => {
  const values = new Subject<InstanceType<TElement>[TProp]>();

  return {
    ngOnChanges: (changes: SimpleChanges) => {
      if (on in changes) {
        values.next(changes[on as keyof SimpleChanges].currentValue);
      }
    },
    ...useObservable(runEffect(values)),
  };
};
