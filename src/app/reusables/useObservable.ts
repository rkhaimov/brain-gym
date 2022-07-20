import { noop, Observable, Subscription } from 'rxjs';
import { Hook } from './ComposableComponent';

export function useObservable(
  factory: () => Observable<unknown>
): Hook {
  const subscription = new Subscription();

  return {
    ngOnInit: () => subscription.add(factory().subscribe(noop)),
    ngOnDestroy: () => subscription.unsubscribe(),
  };
}
