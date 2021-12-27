import { prettyDOM } from '@testing-library/dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { Observable } from 'rxjs';
import { byFrame } from './byFrame';
import { createElement, VirtualElement } from './createElement';
import { createRenderer } from './render';

describe('It handles simple cases', () => {
  test('One level deep', () => {
    const ui = <h1>Hello world</h1>;
    const ui$ = createElement('h1', 'Hello world');

    expect(renderReact(ui).output).toEqual(renderObservable(ui$).output);
  });

  test('Two level deep', () => {
    const ui = (
      <div>
        <h1>Hello world</h1>
      </div>
    );

    const ui$ = createElement('div', createElement('h1', 'Hello world'));

    expect(renderReact(ui).output).toEqual(renderObservable(ui$).output);
  });
});

function renderReact(jsx: JSX.Element) {
  const container = document.createElement('main');

  ReactDOM.render(jsx, container);

  return { container, output: prettyDOM(container) };
}

function renderObservable(element: Observable<VirtualElement>) {
  let outputs: string[] = [];
  const dom = document.createElement('main');
  const render = createRenderer();

  const subscription = element.subscribe((ui) => {
    try {
      outputs.push(prettyDOM(render(ui, dom)) as string);
    } catch (e: unknown) {
      outputs = [(e as Error).message];

      subscription.unsubscribe();
    }
  });

  return {
    get output() {
      return outputs.join('\n\n');
    },
    dom,
  };
}
