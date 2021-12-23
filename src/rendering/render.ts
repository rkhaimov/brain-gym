import { Observable } from 'rxjs';
import { VirtualElement } from '../../global';
import { applyChangesToRealElement } from './applyChangesToRealElement';
import { byFrame } from './byFrame';

export function createRenderer() {
  let prev: VirtualElement | undefined;

  return (curr: VirtualElement, parent: HTMLElement) => {
    applyChangesToRealElement(prev, curr, parent);

    prev = curr;

    return parent;
  };
}

export function renderUItoDOM(ui$: Observable<VirtualElement>) {
  const render = createRenderer();
  const main = document.createElement('main');
  document.body.appendChild(main);

  ui$.pipe(byFrame()).subscribe((dom) => render(dom, main));
}