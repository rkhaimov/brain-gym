import { Attributes, ElementType, Listeners, MetaTree, Props, RenderingTree } from './types';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';

export function toRenderingTree(ui: MetaTree): Observable<RenderingTree> {
  if (ui.type === ElementType.String) {
    return of(ui.factory);
  }

  const factory = ui.factory;

  if (typeof factory === 'function') {
    return factory().pipe(switchMap(toRenderingTree));
  }

  return combineLatest(ui.children.map(toRenderingTree)).pipe(
    map((children) => {
      return {
        tag: factory,
        listeners: propsToListeners(ui.props),
        attributes: propsToAttributes(ui.props),
        children,
      };
    })
  );
}

function propsToAttributes(props: Props): Attributes {
  if (props === null) {
    return {};
  }

  const attributes = Object.entries(props).filter(
    (pair): pair is [string, string] => typeof pair[1] !== 'function'
  );

  return Object.fromEntries(attributes);
}

function propsToListeners(props: Props): Listeners {
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
