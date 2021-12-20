import { applyChangesToRealElement } from './applyChangesToRealElement';
import { VirtualElement } from './elements';

export function createRenderer() {
  let prev: VirtualElement | undefined;

  return (curr: VirtualElement, parent: HTMLElement) => {
    applyChangesToRealElement(prev, curr, parent);

    prev = curr;

    return parent;
  };
}
