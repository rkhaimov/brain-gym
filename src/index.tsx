// Create sync 'To do' app, then convert it to async
// Implement adding, removing, editing, searching and filtering

import { of, switchMap } from 'rxjs';
import { byFrame } from './byFrame';
import { createElement } from './createElement';

import './global.css';
import { createTodoModel } from './models';
import { createRenderer } from './render';

const { todos$ } = createTodoModel();

const ui$ = (
  <div className={of('app')}>
    <h1>Things to be done</h1>
    <div className={of('search')}>
      <input type={of('text')} placeholder={of('Search or add new...')} onInput={console.log} />
      <button onClick={console.log}>add</button>
    </div>
    <div className={of('filters')}>
      <button onClick={console.log}>all</button>
      <button onClick={console.log}>completed</button>
      <button onClick={console.log}>done</button>
    </div>
    {todos$.pipe(
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
