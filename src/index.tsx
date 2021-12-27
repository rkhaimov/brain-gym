// Create sync 'To do' app, then convert it to async
// Implement adding, removing, editing, searching and filtering

// Added item should be cleared from input

import {
  BehaviorSubject,
  debounceTime,
  from,
  Observable,
  startWith,
  switchMap,
} from 'rxjs';
import './global.css';
import { createElement, VirtualElement } from './rendering/createElement';
import { renderUItoDOM } from './rendering/render';
import { wait } from './utils';

renderUItoDOM(createSearchableSelect());

function createSearchableSelect(): Observable<VirtualElement> {
  const search$ = new BehaviorSubject('');

  const options$ = search$.pipe(
    debounceTime(1_000),
    switchMap((search) => getOptionsBySearch(search)),
    startWith([]),
    switchMap((options) => (
      <div>
        {options.map((option) => (
          <h1>{option}</h1>
        ))}
      </div>
    ))
  );

  return (
    <div>
      <input onInput={(e) => search$.next(e.target.value)} />
      {options$}
    </div>
  );
}

async function getOptionsBySearch(search: string) {
  console.log('Called');

  await wait(1_000);

  return ['Ada', 'John', 'Jim', search];
}
