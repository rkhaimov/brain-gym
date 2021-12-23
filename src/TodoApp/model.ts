import {
  BehaviorSubject,
  map,
  mapTo,
  merge, Observable,
  startWith,
  Subject,
  switchMap,
  withLatestFrom
} from 'rxjs';

type Todo = {
  title: string;
  done: boolean;
};

export enum Filter {
  All,
  Completed,
  Undone,
}

export function createTodoModel() {
  // State
  const search$ = new BehaviorSubject('');
  const _todos$ = new BehaviorSubject<Todo[]>([
    { title: 'Create TODO app', done: false },
    {
      title: 'This thing is done',
      done: true,
    },
  ]);

  // Operations

  // Adding
  const add$ = new Subject<void>();
  add$
    .pipe(
      withLatestFrom(search$, _todos$),
      map(([_, search, todos]) => [...todos, { title: search, done: false }])
    )
    .subscribe(_todos$);

  // Removing
  const remove$ = new Subject<Todo>();
  remove$
    .pipe(
      withLatestFrom(_todos$),
      map(([toRemove, todos]) => todos.filter((todo) => todo !== toRemove))
    )
    .subscribe(_todos$);

  // Toggling
  const toggle$ = new Subject<Todo>();
  toggle$
    .pipe(
      withLatestFrom(_todos$),
      map(([toToggle, todos]) =>
        todos.map((todo) => {
          if (todo === toToggle) {
            todo.done = !todo.done;
          }

          return todo;
        })
      )
    )
    .subscribe(_todos$);

  const all$ = new Subject<void>();
  const completed$ = new Subject<void>();
  const undone$ = new Subject<void>();

  const filter$: Observable<Filter> = merge(
    all$.pipe(mapTo(Filter.All)),
    completed$.pipe(mapTo(Filter.Completed)),
    undone$.pipe(mapTo(Filter.Undone))
  ).pipe(startWith(Filter.All));

  const todos$ = filter$.pipe(
    switchMap((type) =>
      _todos$.pipe(
        map((todos) => {
          if (type === Filter.All) {
            return todos;
          }

          if (type === Filter.Completed) {
            return todos.filter((todo) => todo.done);
          }

          return todos.filter((todo) => todo.done === false);
        })
      )
    )
  );

  return {
    todos$,
    filter$,
    handleSearch: (event: InputEvent & { target: HTMLInputElement }) =>
      search$.next(event.target.value),
    handleAdd: () => add$.next(),
    handleFilterAll: () => all$.next(),
    handleFilterUndone: () => undone$.next(),
    handleFilterCompleted: () => completed$.next(),
    handleDoneToggle: (todo: Todo) => toggle$.next(todo),
    handleRemove: (todo: Todo) => remove$.next(todo),
  };
}
