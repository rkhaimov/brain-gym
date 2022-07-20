import {
  BehaviorSubject,
  identity,
  Observable,
  scan,
  startWith,
  Subject,
} from 'rxjs';

export function createStorage<TState>(initial: TState): Storage<TState> {
  const updates = new Subject<(state: TState) => TState>();
  const state$ = new BehaviorSubject<TState>(initial);

  updates
    .pipe(
      startWith(identity),
      scan((state, action) => action(state), initial)
    )
    .subscribe(state$);

  return {
    state$: state$.asObservable(),
    update: (updater) => updates.next(updater),
  };
}

type Storage<TState> = {
  state$: Observable<TState>;
  update(updater: (state: TState) => TState): void;
};
