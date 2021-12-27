import { prettyDOM } from '@testing-library/dom';
import { last } from 'lodash-es';
import ReactDOM from 'react-dom';
import { Observable } from 'rxjs';
import { VirtualNodeOrString } from './createElement';
import { createRenderer } from './render';

export function renderReact(jsx: JSX.Element) {
  const container = document.createElement('main');

  ReactDOM.render(jsx, container);

  return {
    container,
    async act(clb: () => unknown) {
      document.body.appendChild(container);

      await clb();

      document.body.removeChild(container);
    },
    get output() {
      return prettyDOM(container);
    },
  };
}

export function renderObservable(element: Observable<VirtualNodeOrString>) {
  let outputs: string[] = [];
  let error: Error;
  const container = document.createElement('main');
  const render = createRenderer();

  const subscription = element.subscribe((ui) => {
    try {
      outputs.push(prettyDOM(render(ui, container)) as string);
    } catch (e: unknown) {
      error = e as Error;

      subscription.unsubscribe();
    }
  });

  return {
    get output() {
      if (error) {
        throw error;
      }

      return last(outputs);
    },
    container,
    async act(clb: () => unknown) {
      document.body.appendChild(container);

      await clb();

      document.body.removeChild(container);
    },
  };
}
