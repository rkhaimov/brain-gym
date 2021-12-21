// Create sync 'To do' app, then convert it to async
// Implement adding, removing, editing, searching and filtering

// I do not like callbacks
// I do not like having JSX
// I do not like props

// Callback updating does not work

import {
  BehaviorSubject,
  map,
  mapTo,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { byFrame } from './byFrame';
import { createRenderer } from './render';

import './global.css';
import { createElement } from './createElement';

// State
type Todo = {
  title: string;
  done: boolean;
};

const search$ = new BehaviorSubject('');
const todos$ = new BehaviorSubject<Todo[]>([
  { title: 'Create TODO app', done: false },
  {
    title: 'Do stupid shit',
    done: true,
  },
]);

// Operations

// Adding
const add$ = new Subject();
add$
  .pipe(
    withLatestFrom(search$, todos$),
    map(([_, search, todos]) => [...todos, { title: search, done: false }])
  )
  .subscribe(todos$);

// Removing
const remove$ = new Subject<Todo>();
remove$
  .pipe(
    withLatestFrom(todos$),
    map(([toRemove, todos]) => todos.filter((todo) => todo !== toRemove))
  )
  .subscribe(todos$);

// Toggling
const toggle$ = new Subject<Todo>();
toggle$
  .pipe(
    withLatestFrom(todos$),
    map(([toToggle, todos]) =>
      todos.map((todo) => {
        if (todo === toToggle) {
          todo.done = !todo.done;
        }

        return todo;
      })
    )
  )
  .subscribe(todos$);

const all$ = new Subject();
const completed$ = new Subject();
const undone$ = new Subject();

const filtered$ = merge(
  all$.pipe(mapTo('all' as const)),
  completed$.pipe(mapTo('completed' as const)),
  undone$.pipe(mapTo('undone' as const))
).pipe(
  startWith('all'),
  switchMap((type) =>
    todos$.pipe(
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

const ui$ = (
  <div className={of('app')}>
    <div className={of('search')}>
      <input type={of('text')} onInput={console.log} />
      <button onClick={console.log}>add</button>
    </div>
    <div className={of('filters')}>
      <button onClick={console.log}>all</button>
      <button onClick={console.log}>completed</button>
      <button onClick={console.log}>done</button>
    </div>
    {filtered$.pipe(
      switchMap((todos) => (
        <div className={of('todos')}>
          {todos.map((todo) => (
            <div className={of('todo')}>
              <a
                className={of(todo.done ? 'done' : 'undone')}
                onClick={console.log}
              >
                {todo.title}
              </a>
              <button onClick={console.log}>X</button>
            </div>
          ))}
        </div>
      ))
    )}
  </div>
);

const render = createRenderer();
const main = document.createElement('main');
document.body.appendChild(main);

ui$.pipe(byFrame()).subscribe((dom) => render(dom, main));
