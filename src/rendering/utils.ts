import { prettyDOM } from '@testing-library/dom';
import ReactDOM from 'react-dom';

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
      return prettyDOM(container) as string;
    },
  };
}
