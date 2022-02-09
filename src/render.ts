import { IO } from './io';

export type VirtualNode =
  | { type: string; text: string }
  | { type: string; children: VirtualNode[] };

export const render = (node: VirtualNode): IO<void> => {
  return IO.of(() => {
    const dom = toDOM(node);

    document.body.innerHTML = '';
    document.body.appendChild(dom);
  });
};

const toDOM = (virtual: VirtualNode): HTMLElement => {
  const element = document.createElement(virtual.type);

  // TODO: Rewrite using expressions (Either?)
  if ('text' in virtual) {
    element.innerText = virtual.text;

    return element;
  }

  const children = virtual.children.map(toDOM);

  children.forEach((child) => element.appendChild(child));

  return element;
};
