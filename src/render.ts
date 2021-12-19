import { ViewElement } from './elements';
import { Observable, OperatorFunction } from 'rxjs';

export function createRenderer() {
  let prev: ViewElement | undefined;

  return (curr: ViewElement, parent: HTMLElement) => {
    renderDiffOnly(prev, curr, parent);

    prev = curr;

    return parent;
  };
}

function renderDiffOnly(
  prev: ViewElement | undefined,
  curr: ViewElement | undefined,
  parent: HTMLElement
): void {
  if (prev === undefined && typeof curr === 'object') {
    return renderElementDeep(curr, parent);
  }

  if (typeof prev === 'string' && typeof curr === 'string') {
    if (prev === curr) {
      return;
    }

    parent.innerHTML = curr;

    return;
  }

  if (typeof prev === 'object' && typeof curr === 'object') {
    const node = parent.querySelector(`${prev.type}`) as HTMLElement;

    if (prev.type === curr.type) {
      if (isCollectionsShallowEqual(prev.attributes, curr.attributes)) {
        return prev.children.forEach((child, index) =>
          renderDiffOnly(child, curr.children[index], node)
        );
      }

      Object.keys(prev.attributes).forEach((key) => node.removeAttribute(key));

      Object.entries(curr.attributes).forEach(([key, value]) => {
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

      return prev.children.forEach((child, index) =>
        renderDiffOnly(child, curr.children[index], node)
      );
    }

    if (prev.type !== curr.type) {
      parent.removeChild(node);

      return renderElementDeep(curr, parent);
    }
  }

  console.log(prev, curr);
  assert(false, 'Given case is not supported');
}

function renderElementDeep(element: ViewElement, parent: HTMLElement): void {
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

  return element.children.forEach((child) => renderElementDeep(child, current));
}

function isCollectionsShallowEqual(
  left: Record<string, unknown>,
  right: Record<string, unknown>
) {
  if (Object.keys(left).length !== Object.keys(right).length) {
    return false;
  }

  return Object.entries(left).every(([key, value]) => value === right[key]);
}

export function byFrame<TValue>(): OperatorFunction<TValue, TValue> {
  return (observable) =>
    new Observable((emitter) => {
      let id: undefined | ReturnType<typeof requestAnimationFrame>;
      const subscription = observable.subscribe((value) => {
        if (id) {
          cancelAnimationFrame(id);

          id = undefined;
        }

        id = requestAnimationFrame(() => emitter.next(value));
      });

      return () => {
        subscription.unsubscribe();

        if (id) {
          cancelAnimationFrame(id);
        }
      };
    });
}

function assert(condition: boolean, message: string) {
  if (condition) {
    return;
  }

  throw new Error(message);
}
