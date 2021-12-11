import { ViewElement } from './elements';

export function render(element: ViewElement, parent: HTMLElement) {
  parent.innerHTML = '';

  _render(element, parent);

  return parent;
}

function _render(element: ViewElement, parent: HTMLElement): void {
  if (typeof element === 'string') {
    parent.innerHTML = element;

    return;
  }

  const current = document.createElement(element.type);

  Object.entries(element.attributes).forEach(([key, value]) => {
    const isEvent = key.startsWith('on');

    if (isEvent === false) {
      current.setAttribute(key, value as unknown as string);

      return;
    }

    const name = key.slice(2).toLowerCase();

    current.addEventListener(
      name as keyof HTMLElementEventMap,
      value as unknown as () => unknown
    );
  });

  parent.appendChild(current);

  return element.children.forEach((child) => _render(child, current));
}
