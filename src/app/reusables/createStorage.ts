import {
  BehaviorSubject,
  identity,
  Observable,
  scan,
  startWith,
  Subject,
} from 'rxjs';

export function createStorage<TState>(initial: TState): Storage<TState> {
  const actions: Storage<TState>['actions'] = new Subject();
  const state$ = new BehaviorSubject<TState>(initial);

  actions
    .pipe(
      startWith(identity),
      scan((state, action) => action(state), initial)
    )
    .subscribe(state$);

  return {
    state$: state$.asObservable(),
    actions,
  };
}

type Storage<TState> = {
  actions: Subject<(state: TState) => TState>;
  state$: Observable<TState>;
};
