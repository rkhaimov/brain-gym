import {
  BehaviorSubject,
  map,
  mapTo,
  merge,
  startWith,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';

export function createTodoModel() {
  // State
  type Todo = {
    title: string;
    done: boolean;
  };

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
  const add$ = new Subject();
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

  const all$ = new Subject();
  const completed$ = new Subject();
  const undone$ = new Subject();

  const todos$ = merge(
    all$.pipe(mapTo('all' as const)),
    completed$.pipe(mapTo('completed' as const)),
    undone$.pipe(mapTo('undone' as const))
  ).pipe(
    startWith('all'),
    switchMap((type) =>
      _todos$.pipe(
        map((todos) => {
          if (type === 'all') {
            return todos;
          }

          if (type === 'completed') {
            return todos.filter((todo) => todo.done);
          }

          return todos.filter((todo) => todo.done === false);
        })
      )
    )
  );

  return { todos$ };
}