import { zip } from 'lodash-es';
import { assert } from '../utils';
import { RenderingTree, RenderingTreeObject } from './types';

export function toDOM(
  curr: RenderingTree | undefined,
  next: RenderingTree | undefined,
  parent: HTMLElement
): RenderingTree | undefined {
  if (typeof curr === 'string' && typeof next === 'string') {
    return update.stringsAreProbablyDifferent(curr, next, parent);
  }

  if (typeof curr === 'string' && typeof next === 'object') {
    return update.stringToObject(curr, next, parent);
  }

  if (typeof curr === 'string' && next === undefined) {
    return update.stringToUndefined(curr, next, parent);
  }

  if (curr === undefined && typeof next === 'string') {
    return update.undefinedToString(curr, next, parent);
  }

  if (curr === undefined && typeof next === 'object') {
    return update.undefinedToObject(curr, next, parent);
  }

  if (typeof curr === 'object' && typeof next === 'string') {
    return update.objectToString(curr, next, parent);
  }

  if (typeof curr === 'object' && next === undefined) {
    return update.objectToUndefined(curr);
  }

  assert(typeof curr === 'object' && typeof next === 'object');

  if (curr.tag !== next.tag) {
    return update.elementsTagsAreDifferent(curr, next);
  }

  // Events are skipped
  if (isCollectionsShallowEqual(curr.attributes, next.attributes) === false) {
    return update.attributesAreDifferent(curr, next);
  }

  return update.childrenAreProbablyDifferent(curr, next);
}

const update = {
  stringsAreProbablyDifferent: (
    curr: string,
    next: string,
    parent: HTMLElement
  ): RenderingTree => {
    parent.innerHTML = next;

    return next;
  },
  elementsTagsAreDifferent: (
    curr: RenderingTreeObject,
    next: RenderingTreeObject
  ): RenderingTree => {
    const [element, node] = createRealElementFromAndLinkRefs(next);

    assert(typeof node === 'object');

    getRealElement(curr).replaceWith(node);

    return element;
  },
  attributesAreDifferent: (
    curr: RenderingTreeObject,
    next: RenderingTreeObject
  ): RenderingTree => {
    removeAttributesFromNode(curr, getRealElement(curr));
    assignAttributesToNode(next, getRealElement(curr));

    return update.childrenAreProbablyDifferent(curr, next);
  },
  undefinedToObject: (
    curr: undefined,
    next: RenderingTreeObject,
    parent: HTMLElement
  ): RenderingTree => {
    const [element, node] = createRealElementFromAndLinkRefs(next);

    assert(typeof node === 'object');

    parent.appendChild(node);

    return element;
  },
  childrenAreProbablyDifferent: (
    curr: RenderingTreeObject,
    next: RenderingTreeObject
  ): RenderingTree => {
    next._ref = curr._ref;

    next.children = zip(curr.children, next.children)
      .map(([currChild, nextChild]) =>
        toDOM(currChild, nextChild, getRealElement(curr))
      )
      .filter((child): child is RenderingTree => child !== undefined);

    return next;
  },
  objectToUndefined: (curr: RenderingTreeObject) => {
    getRealElement(curr).remove();

    return undefined;
  },
  stringToObject: (
    curr: string,
    next: RenderingTreeObject,
    parent: HTMLElement
  ): RenderingTree => {
    const [element, node] = createRealElementFromAndLinkRefs(next);

    assert(typeof node === 'object');

    parent.innerHTML = '';
    parent.appendChild(node);

    return element;
  },
  undefinedToString: (
    curr: undefined,
    next: string,
    parent: HTMLElement
  ): RenderingTree => never(),
  objectToString: (
    curr: RenderingTreeObject,
    next: string,
    parent: HTMLElement
  ): RenderingTree => never(),
  stringToUndefined: (
    curr: string,
    next: undefined,
    parent: HTMLElement
  ): RenderingTree => never(),
};

function never(): never {
  throw new Error('Given case is not supported');
}

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
  element: RenderingTree
): [RenderingTree, string | HTMLElement] {
  if (typeof element === 'string') {
    return [element, element];
  }

  element._ref = document.createElement(element.tag);
  const node = element._ref;

  assignAttributesToNode(element, node);

  element.children = element.children.map((child) => {
    const [chelement, chnode] = createRealElementFromAndLinkRefs(child);

    if (typeof chnode === 'string') {
      node.innerHTML = chnode;
    } else {
      node.appendChild(chnode);
    }

    return chelement;
  });

  return [element, node];
}

function removeAttributesFromNode(
  element: RenderingTreeObject,
  node: HTMLElement
) {
  Object.entries(element.attributes).forEach(([key, value]) =>
    node.setAttribute(key, value)
  );

  Object.entries(element.listeners).forEach(([name, clb]) =>
    node.addEventListener(name, clb)
  );
}

function assignAttributesToNode(
  element: RenderingTreeObject,
  node: HTMLElement
) {
  Object.entries(element.attributes).forEach(([key, value]) =>
    node.setAttribute(key, value)
  );

  Object.entries(element.listeners).forEach(([name, clb]) =>
    node.addEventListener(name, clb)
  );
}

function getRealElement(element: RenderingTreeObject) {
  assert(element._ref !== undefined, 'Expected element to be on the DOM');

  return element._ref;
}
