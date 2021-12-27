import { Observable } from 'rxjs';
import { applyChangesToRealElement } from './applyChangesToRealElement';
import { byFrame } from './byFrame';
import { VirtualNodeOrString } from './createElement';

export function createRenderer() {
  let prev: VirtualNodeOrString | undefined;

  return (curr: VirtualNodeOrString, parent: HTMLElement) => {
    applyChangesToRealElement(prev, curr, parent);

    prev = curr;

    return parent;
  };
}

export function renderUItoDOM(ui$: Observable<VirtualNodeOrString>) {
  const render = createRenderer();
  const main = document.createElement('main');
  document.body.appendChild(main);

  ui$.pipe(byFrame()).subscribe((dom) => render(dom, main));
}