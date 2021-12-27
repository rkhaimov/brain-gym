import { prettyDOM } from '@testing-library/dom';
import ReactDOM from 'react-dom';
import { Observable } from 'rxjs';
import { VirtualNodeOrString } from './createElement';
import { createRenderer } from './render';

export function renderReact(jsx: JSX.Element) {
  const container = document.createElement('main');

  ReactDOM.render(jsx, container);

  return { container, output: prettyDOM(container) };
}

export function renderObservable(element: Observable<VirtualNodeOrString>) {
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