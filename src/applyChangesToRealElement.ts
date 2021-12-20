import { zip } from 'lodash-es';
import { assert } from './assert';
import { VirtualElement, VirtualObject } from './elements';

export function applyChangesToRealElement(
  prev: VirtualElement | undefined,
  curr: VirtualElement | undefined,
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
    update.objectToUndefined(prev, curr, parent);

    return;
  }

  assert(typeof prev === 'object' && typeof curr === 'object');

  if (prev.type !== curr.type) {
    update.elementsAreDifferent(prev, curr, parent);

    return;
  }

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
  elementsAreDifferent: (
    prev: VirtualObject,
    curr: VirtualObject,
    parent: HTMLElement
  ) => {
    const tree = createRealElementFrom(curr);

    assert(typeof tree === 'object');

    parent.replaceChild(tree, getRealElement(prev));
  },
  attributesAreDifferent: (prev: VirtualObject, curr: VirtualObject) => {
    Object.entries(curr.attributes).forEach(([key, value]) => {
      assert(typeof value === 'string');

      getRealElement(prev).setAttribute(key, value);
    });

    update.childrenAreProbablyDifferent(prev, curr);
  },
  undefinedToObject: (
    prev: undefined,
    curr: VirtualObject,
    parent: HTMLElement
  ) => {
    const tree = createRealElementFrom(curr);

    assert(typeof tree === 'object');

    parent.appendChild(tree);
  },
  childrenAreProbablyDifferent: (prev: VirtualObject, curr: VirtualObject) => {
    // Need to find better way to model this
    curr._ref = prev._ref;

    zip(prev.children, curr.children).forEach(([prevChild, currChild]) =>
      applyChangesToRealElement(prevChild, currChild, getRealElement(prev))
    );
  },
  objectToUndefined: (
    prev: VirtualObject,
    curr: undefined,
    parent: HTMLElement
  ) => {
    parent.removeChild(getRealElement(prev));
  },
  stringToObject: (prev: string, curr: VirtualObject, parent: HTMLElement) => {
    const tree = createRealElementFrom(curr);

    assert(typeof tree === 'object');

    parent.innerHTML = '';
    parent.appendChild(tree);
  },
  undefinedToString: (prev: undefined, curr: string, parent: HTMLElement) =>
    assert(false, 'Given case is not supported. undefinedToString'),
  objectToString: (prev: VirtualObject, curr: string, parent: HTMLElement) =>
    assert(false, 'Given case is not supported. objectToString'),
  stringToUndefined: (prev: string, curr: undefined, parent: HTMLElement) =>
    assert(false, 'Given case is not supported. stringToUndefined'),
};

function isCollectionsShallowEqual(
  left: Record<string, unknown>,
  right: Record<string, unknown>
) {
  if (Object.keys(left).length !== Object.keys(right).length) {
    return false;
  }

  return Object.entries(left).every(([key, value]) => value === right[key]);
}

function createRealElementFrom(
  virtualElement: VirtualElement
): HTMLElement | string {
  if (typeof virtualElement === 'string') {
    return virtualElement;
  }

  virtualElement._ref = document.createElement(virtualElement.type);
  const node = virtualElement._ref;

  Object.entries(virtualElement.attributes).forEach(([key, value]) => {
    const isEvent = key.startsWith('on');

    if (isEvent === false) {
      node.setAttribute(key, value as unknown as string);

      return;
    }

    const name = key.slice(2).toLowerCase();

    node.addEventListener(
      name as keyof HTMLElementEventMap,
      value as unknown as () => unknown
    );
  });

  virtualElement.children.forEach((child) => {
    const tree = createRealElementFrom(child);

    if (typeof tree === 'string') {
      node.innerHTML = tree;
    } else {
      node.appendChild(tree);
    }
  });

  return node;
}

function getRealElement(element: VirtualObject) {
  assert(element._ref !== undefined, 'Expected element to be on the DOM');

  return element._ref;
}
