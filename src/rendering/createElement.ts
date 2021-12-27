import { combineLatest, map, Observable, of } from 'rxjs';

type FC = (
  props: Props | null | undefined,
  children: Children
) => ReturnType<typeof createElement>;

export function createElement(
  type: string | FC,
  props?: Props | null,
  ...children: Children
): Observable<VirtualNode> {
  if (typeof type === 'function') {
    return type(props, children);
  }

  return combineLatest([prepareChildren(children), prepareProps(props)]).pipe(
    map((received) => ({
      type,
      children: received[0],
      attributes: received[1],
    }))
  );
}

export const Fragment: FC = (_, children) => {
  return prepareChildren(children).pipe(
    map((received) => ({
      type: 'fragment',
      attributes: {},
      children: received,
    }))
  );
};

function prepareChildren(
  children: Children
): Observable<VirtualNodeOrString[]> {
  if (children.length === 0) {
    return of([]);
  }

  const converted = children.map((child) =>
    typeof child === 'string' ? of(child) : child
  );

  return combineLatest(converted).pipe(map(received => {
    return received.flatMap((received) => {
      if (typeof received === 'string') {
        return received;
      }

      if (received.type === 'fragment') {
        return received.children;
      }

      return received;
    });
  }));
}

function prepareProps(
  props?: Props | null
): Observable<VirtualNode['attributes']> {
  if (props === null || props === undefined) {
    return of({});
  }

  const events = Object.entries(props).filter(
    ([, value]) => typeof value === 'function'
  );

  const attributes = Object.entries(props).filter(
    ([, value]) => typeof value !== 'function'
  ) as Array<[string, Observable<string>]>;

  const converted: Array<Observable<[string, string]>> = attributes.map(
    ([key, value]) => value.pipe(map((received) => [key, received]))
  );

  return combineLatest(converted).pipe(
    map((entries) => ({
      ...Object.fromEntries(entries),
      ...Object.fromEntries(events),
    }))
  );
}

type Props = {
  className?: Observable<string>;
  type?: Observable<string>;
  title?: Observable<string>;
  onInput?: JSX.IntrinsicElements['input']['onInput'];
  onClick?: JSX.IntrinsicElements['button']['onClick'];
};

export type VirtualNodeOrString = string | VirtualNode;

export type VirtualNode = {
  type: string;
  attributes: Record<string, unknown>;
  children: VirtualNodeOrString[];
  _ref?: HTMLElement;
};

type Children = Array<string | Observable<VirtualNodeOrString>>;
