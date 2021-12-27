import { combineLatest, map, Observable, of } from 'rxjs';

export function createElement(
  type: string,
  ...children: Array<string | Observable<VirtualElement>>
): Observable<VirtualNode> {
  const converted = children.map((child) =>
    typeof child === 'string' ? of(child) : child
  );

  return combineLatest(converted).pipe(
    map((received) => ({ type, children: received, attributes: {} }))
  );
}

export type VirtualElement = string | VirtualNode;

export type VirtualNode = {
  type: string;
  attributes: Record<string, unknown>;
  children: VirtualElement[];
  _ref?: HTMLElement;
};
