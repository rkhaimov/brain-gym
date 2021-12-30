import { Attributes, Listeners, Props, RenderingTree } from './types';

export function commit(container: HTMLElement, tree: RenderingTree) {
  if (typeof tree === 'string') {
    container.innerHTML = tree;

    return;
  }

  const node = document.createElement(tree.tag);

  for (const [attr, value] of Object.entries(tree.attributes)) {
    node.setAttribute(attr, value);
  }

  for (const [event, handler] of Object.entries(tree.listeners)) {
    node.addEventListener(event, handler);
  }

  tree.children.forEach((child) => commit(node, child));

  container.appendChild(node);
}

export function propsToAttributes(props: Props): Attributes {
  if (props === null) {
    return {};
  }

  const attributes = Object.entries(props).filter(
    (pair): pair is [string, string] => typeof pair[1] !== 'function'
  );

  return Object.fromEntries(attributes);
}

export function propsToListeners(props: Props): Listeners {
  if (props === null) {
    return {};
  }

  const listeners = Object.entries(props)
    .filter(
      (pair): pair is [string, () => void] => typeof pair[1] === 'function'
    )
    .map(([key, value]) => [key.slice(2).toLowerCase(), value]);

  return Object.fromEntries(listeners);
}
