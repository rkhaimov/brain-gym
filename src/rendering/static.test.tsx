import React from 'react';
import { of } from 'rxjs';
import { createElement } from './createElement';
import { renderObservable, renderReact } from './utils';

test('It handles one level element', () => {
  const ui = <h1>Hello world</h1>;
  const ui$ = createElement('h1', null, 'Hello world');

  expect(renderReact(ui).output).toEqual(renderObservable(ui$).output);
});

test('It handles two (or more) levels element', () => {
  const ui = (
    <div>
      <h1>Hello world</h1>
    </div>
  );

  const ui$ = createElement(
    'div',
    null,
    createElement('h1', null, 'Hello world')
  );

  expect(renderReact(ui).output).toEqual(renderObservable(ui$).output);
});

test('It handles static attributes allowing className', () => {
  const ui = (
    <div className="app" title="example">
      <h1 className="title">Hello world</h1>
      <div className="container" />
    </div>
  );

  const ui$ = createElement(
    'div',
    { className: of('app'), title: of('example') },
    createElement('h1', { className: of('title') }, 'Hello world'),
    createElement('div', { className: of('container') })
  );

  expect(renderReact(ui).output).toEqual(renderObservable(ui$).output);
});
