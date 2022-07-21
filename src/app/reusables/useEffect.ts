import { Hook } from './ComposableComponent';
import { useObservable } from './useObservable';
import { noop } from 'rxjs';

export function useEffect(runEffect: () => void | (() => void)): Hook {
  let teardown = noop;

  return {
    ngOnInit: () => {
      teardown = runEffect() ?? teardown;
    },
    ngOnDestroy: () => teardown(),
  };
}
