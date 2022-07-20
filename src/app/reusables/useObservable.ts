import { noop, Observable, Subscription } from 'rxjs';
import { ComposableUtils } from './ComposableComponent';

export function useObservable(obs: Observable<unknown>): ComposableUtils {
  const subscription = new Subscription();

  return {
    ngOnInit: () => subscription.add(obs.subscribe(noop)),
    ngOnDestroy: () => subscription.unsubscribe(),
  };
}
