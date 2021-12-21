import { applyChangesToRealElement } from './applyChangesToRealElement';
import { VirtualElement } from '../global';

export function createRenderer() {
  let prev: VirtualElement | undefined;

  return (curr: VirtualElement, parent: HTMLElement) => {
    applyChangesToRealElement(prev, curr, parent);

    prev = curr;

    return parent;
  };
}
