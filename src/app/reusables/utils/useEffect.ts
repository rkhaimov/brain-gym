import { useObservable } from './useObservable';
import { noop } from 'rxjs';
import { createHook, Hook } from './hook';

export function useEffect(runEffect: () => void | (() => void)): Hook {
  let teardown = noop;

  return createHook({
    ngOnInit: () => {
      teardown = runEffect() ?? teardown;
    },
    ngOnDestroy: () => teardown(),
  });
}
