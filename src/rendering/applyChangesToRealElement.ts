import { zip } from 'lodash-es';
import { assert } from '../utils';
import { VirtualNodeOrString, VirtualNode } from './createElement';

export function applyChangesToRealElement(
  prev: VirtualNodeOrString | undefined,
  curr: VirtualNodeOrString | undefined,
  parent: HTMLElement
) {
  if (typeof prev === 'string' && typeof curr === 'string') {
    update.stringsAreProbablyDifferent(prev, curr, parent);

    return;
  }

  if (typeof prev === 'string' && typeof curr === 'object') {
    update.stringToObject(prev, curr, parent);

    return;
  }

  if (typeof prev === 'string' && curr === undefined) {
    update.stringToUndefined(prev, curr, parent);

    return;
  }

  if (prev === undefined && typeof curr === 'string') {
    update.undefinedToString(prev, curr, parent);

    return;
  }

  if (prev === undefined && typeof curr === 'object') {
    update.undefinedToObject(prev, curr, parent);

    return;
  }

  if (typeof prev === 'object' && typeof curr === 'string') {
    update.objectToString(prev, curr, parent);

    return;
  }

  if (typeof prev === 'object' && curr === undefined) {
    update.objectToUndefined(prev);

    return;
  }

  assert(typeof prev === 'object' && typeof curr === 'object');

  if (prev.type !== curr.type) {
    update.elementsTypeAreDifferent(prev, curr);

    return;
  }

  update.elementsTypeAreEqual(prev, curr);

  if (isCollectionsShallowEqual(prev.attributes, curr.attributes) === false) {
    update.attributesAreDifferent(prev, curr);

    return;
  }

  update.childrenAreProbablyDifferent(prev, curr);
}

const update = {
  stringsAreProbablyDifferent: (
    prev: string,
    curr: string,
    parent: HTMLElement
  ) => {
    parent.innerHTML = curr;
  },
  elementsTypeAreEqual: (prev: VirtualNode, curr: VirtualNode) => {
    curr._ref = prev._ref;
  },
  elementsTypeAreDifferent: (prev: VirtualNode, curr: VirtualNode) => {
    const tree = createRealElementFromAndLinkRefs(curr);

    assert(typeof tree === 'object');

    getRealElement(prev).replaceWith(tree);
  },
  attributesAreDifferent: (prev: VirtualNode, curr: VirtualNode) => {
    removeAttributesFromNode(prev.attributes, getRealElement(prev));
    assignAttributesToNode(curr.attributes, getRealElement(prev));

    update.childrenAreProbablyDifferent(prev, curr);
  },
  undefinedToObject: (
    prev: undefined,
    curr: VirtualNode,
    parent: HTMLElement
  ) => {
    const tree = createRealElementFromAndLinkRefs(curr);

    assert(typeof tree === 'object');

    parent.appendChild(tree);
  },
  childrenAreProbablyDifferent: (prev: VirtualNode, curr: VirtualNode) => {
    zip(prev.children, curr.children).forEach(([prevChild, currChild]) =>
      applyChangesToRealElement(prevChild, currChild, getRealElement(prev))
    );
  },
  objectToUndefined: (prev: VirtualNode) => getRealElement(prev).remove(),
  stringToObject: (prev: string, curr: VirtualNode, parent: HTMLElement) => {
    const tree = createRealElementFromAndLinkRefs(curr);

    assert(typeof tree === 'object');

    parent.innerHTML = '';
    parent.appendChild(tree);
  },
  undefinedToString: (prev: undefined, curr: string, parent: HTMLElement) =>
    assert(false, 'Given case is not supported. undefinedToString'),
  objectToString: (prev: VirtualNode, curr: string, parent: HTMLElement) =>
    assert(false, 'Given case is not supported. objectToString'),
  stringToUndefined: (prev: string, curr: undefined, parent: HTMLElement) =>
    assert(false, 'Given case is not supported. stringToUndefined'),
};

function isCollectionsShallowEqual(
  left: Record<string, unknown>,
  right: Record<string, unknown>
) {
  // Untested
  if (Object.keys(left).length !== Object.keys(right).length) {
    return false;
  }

  return Object.entries(left).every(([key, value]) => value === right[key]);
}

function createRealElementFromAndLinkRefs(
  virtualElement: VirtualNodeOrString
): HTMLElement | string {
  if (typeof virtualElement === 'string') {
    return virtualElement;
  }

  virtualElement._ref = document.createElement(virtualElement.type);
  const node = virtualElement._ref;

  assignAttributesToNode(virtualElement.attributes, node);

  virtualElement.children.forEach((child) => {
    const tree = createRealElementFromAndLinkRefs(child);

    if (typeof tree === 'string') {
      node.innerHTML = tree;
    } else {
      node.appendChild(tree);
    }
  });

  return node;
}

function removeAttributesFromNode(
  attrs: Record<string, unknown>,
  node: HTMLElement
) {
  Object.entries(attrs).forEach(([key, value]) => {
    const isEvent = key.startsWith('on');

    if (isEvent === false) {
      node.removeAttribute(key);

      return;
    }

    const name = key.slice(2).toLowerCase();

    node.removeEventListener(
      name as keyof HTMLElementEventMap,
      value as () => unknown
    );
  });
}

function assignAttributesToNode(
  attrs: Record<string, unknown>,
  node: HTMLElement
) {
  Object.entries(attrs).forEach(([key, value]) => {
    const isEvent = key.startsWith('on');

    if (isEvent === false) {
      node.setAttribute(key, value as string);

      return;
    }

    const name = key.slice(2).toLowerCase();

    node.addEventListener(
      name as keyof HTMLElementEventMap,
      value as () => unknown
    );
  });
}

function getRealElement(element: VirtualNode) {
  assert(element._ref !== undefined, 'Expected element to be on the DOM');

  return element._ref;
}
