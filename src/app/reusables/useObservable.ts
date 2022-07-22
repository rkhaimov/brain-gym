import { noop, Observable, Subscription } from 'rxjs';
import { createHook, Hook } from './ComposableComponent';

export function useObservable(factory: () => Observable<unknown>): Hook {
  const subscription = new Subscription();

  return createHook({
    ngOnInit: () => subscription.add(factory().subscribe(noop)),
    ngOnDestroy: () => subscription.unsubscribe(),
  });
}
