import { merge, Observable, switchMap, tap, withLatestFrom } from 'rxjs';
import { Storage } from './createStorage';

export type AsyncUpdater<TState> = (state: TState) => Observable<TState>;

export const bindAsyncUpdaters = <TState>(
  updaters: Observable<AsyncUpdater<TState>>[],
  storage: Storage<TState>
): Observable<unknown> =>
  merge(...updaters).pipe(
    withLatestFrom(storage.state$),
    switchMap(([updater, state]) => updater(state)),
    tap((state) => storage.update(() => state))
  );
