import { combineLatest, map, Observable, of } from 'rxjs';

export function createElement(
  type: string,
  props: Record<string, Observable<string>> | null,
  ...children: Array<string | Observable<VirtualNodeOrString>>
): Observable<VirtualNode> {
  return combineLatest([prepareChildren(children), prepareProps(props)]).pipe(
    map((received) => ({
      type,
      children: received[0],
      attributes: received[1],
    }))
  );
}

function prepareChildren(
  children: Array<string | Observable<VirtualNodeOrString>>
): Observable<VirtualNodeOrString[]> {
  if (children.length === 0) {
    return of([]);
  }

  const converted = children.map((child) =>
    typeof child === 'string' ? of(child) : child
  );

  return combineLatest(converted);
}

function prepareProps(
  props: Record<string, Observable<string>> | null
): Observable<VirtualNode['attributes']> {
  if (props === null) {
    return of({});
  }

  const converted: Array<Observable<[string, string]>> = Object.entries(
    props
  ).map(([key, value]) =>
    value.pipe(map((received) => [MAP_PROP_TO_ATTR[key] ?? key, received]))
  );

  return combineLatest(converted).pipe(
    map((entries) => Object.fromEntries(entries))
  );
}

const MAP_PROP_TO_ATTR: Record<string, string> = {
  className: 'class',
};

export type VirtualNodeOrString = string | VirtualNode;

export type VirtualNode = {
  type: string;
  attributes: Record<string, unknown>;
  children: VirtualNodeOrString[];
  _ref?: HTMLElement;
};
