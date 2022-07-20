import { Hook } from './ComposableComponent';
import { Observable } from 'rxjs';
import { useObservable } from './useObservable';

export function useEffect(factory: () => Observable<unknown>): Hook {
  return useObservable(factory);
}
