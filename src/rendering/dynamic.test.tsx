import { findByRole } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { times } from 'lodash-es';
import React, { useState } from 'react';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';
import { createElement, Fragment } from './createElement';
import { renderObservable, renderReact } from './utils';

test('It allows to sync string values', async () => {
  // React
  const ui = React.createElement(() => {
    const [title, setTitle] = useState('');

    return (
      <div>
        <input
          type="text"
          onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
        />
        <h1>{title}</h1>
      </div>
    );
  });

  // Observable UI
  const ui$ = createElement(() => {
    const title$ = new BehaviorSubject('');

    return createElement(
      'div',
      null,
      createElement('input', {
        type: of('text'),
        onInput: (e) => title$.next((e.target as HTMLInputElement).value),
      }),
      createElement('h1', null, title$)
    );
  });

  const reactUI = renderReact(ui);
  const observableUI = renderObservable(ui$);

  expect(reactUI.output).toEqual(observableUI.output);

  // Try to apply changes
  await reactUI.act(async () =>
    userEvent.type(
      await findByRole(reactUI.container, 'textbox'),
      'Hello world'
    )
  );

  await observableUI.act(async () =>
    userEvent.type(
      await findByRole(observableUI.container, 'textbox'),
      'Hello world'
    )
  );

  expect(observableUI.output).toEqual(reactUI.output);
});

test('It allows to sync attributes values', async () => {
  const ui = React.createElement(() => {
    const [filter, setFilter] = useState('left');

    return (
      <div>
        <button
          className={filter === 'left' ? 'active' : ''}
          onClick={() => setFilter('left')}
        >
          left
        </button>
        <button
          className={filter === 'right' ? 'active' : ''}
          onClick={() => setFilter('right')}
        >
          right
        </button>
      </div>
    );
  });

  const ui$ = createElement(() => {
    const filter$ = new BehaviorSubject('left');

    return createElement(
      'div',
      null,
      createElement(
        'button',
        {
          className: filter$.pipe(
            map((filter) => (filter === 'left' ? 'active' : ''))
          ),
          onClick: () => filter$.next('left'),
        },
        'left'
      ),
      createElement(
        'button',
        {
          className: filter$.pipe(
            map((filter) => (filter === 'right' ? 'active' : ''))
          ),
          onClick: () => filter$.next('right'),
        },
        'right'
      )
    );
  });

  const reactUI = renderReact(ui);
  const observableUI = renderObservable(ui$);

  expect(observableUI.output).toEqual(reactUI.output);

  await reactUI.act(async () =>
    userEvent.click(
      await findByRole(reactUI.container, 'button', { name: 'right' })
    )
  );

  await observableUI.act(async () =>
    userEvent.click(
      await findByRole(observableUI.container, 'button', { name: 'right' })
    )
  );

  expect(observableUI.output).toEqual(reactUI.output);
});

test('It allows to sync children and it`s attributes', async () => {
  const ui = React.createElement(() => {
    const [count, setCount] = useState(0);

    return (
      <div>
        <input
          type="text"
          onInput={(e) =>
            setCount(parseInt((e.target as HTMLInputElement).value))
          }
        />
        {times(count, (n) => (
          <h1 key={n} className={`${n}`}>
            {n}
          </h1>
        ))}
      </div>
    );
  });

  const ui$ = createElement(() => {
    const count$ = new BehaviorSubject(0);

    return createElement(
      'div',
      null,
      createElement('input', {
        type: of('text'),
        onInput: (e) =>
          count$.next(parseInt((e.target as HTMLInputElement).value)),
      }),
      count$.pipe(
        switchMap((count) =>
          createElement(
            Fragment,
            null,
            times(count, (n) =>
              createElement('h1', { className: of(`${n}`) }, `${n}`)
            )
          )
        )
      )
    );
  });

  const reactUI = renderReact(ui);
  const observableUI = renderObservable(ui$);

  expect(observableUI.output).toEqual(reactUI.output);

  await reactUI.act(async () =>
    userEvent.type(await findByRole(reactUI.container, 'textbox'), '2')
  );

  await observableUI.act(async () =>
    userEvent.type(await findByRole(observableUI.container, 'textbox'), '2')
  );

  expect(observableUI.output).toEqual(reactUI.output);

  await reactUI.act(async () => {
    userEvent.clear(await findByRole(reactUI.container, 'textbox'));
    userEvent.type(await findByRole(reactUI.container, 'textbox'), '1');
  });

  await observableUI.act(async () => {
    userEvent.clear(await findByRole(observableUI.container, 'textbox'));
    userEvent.type(await findByRole(observableUI.container, 'textbox'), '1');
  });

  expect(observableUI.output).toEqual(reactUI.output);
});
