import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  scan,
  switchMap,
} from 'rxjs';
import {
  ElementType,
  FF,
  JSXChildren,
  MemoTree,
  MetaTree,
  Props,
  RenderingTree,
  TagName,
} from './types';
import { assert, wait } from '../utils';
import { propsToAttributes, propsToListeners } from './dom';

test('It persists state based on type only', async () => {
  const Toggle: FF = () => {
    const toggled$ = new BehaviorSubject(false);

    return toggled$.pipe(
      map((toggled) =>
        createElement(
          'button',
          { onClick: () => toggled$.next(!toggled) },
          toggled ? 'Toggled' : 'Untoggled'
        )
      )
    );
  };

  const removed$ = new BehaviorSubject(false);
  const ui = createElement(
    () =>
      removed$.pipe(
        map((removed) => {
          if (removed) {
            return createElement('div', null, createElement(Toggle, null));
          }

          return createElement(
            'div',
            null,
            createElement(Toggle, null),
            createElement(Toggle, null)
          );
        })
      ),
    null
  );

  createRenderer(ui)
    .pipe(
      map((value, index) => {
        if (index === 0) {
          // @ts-ignore
          setTimeout(() => value.children[0].listeners.click(), 100);
        }

        return value;
      })
    )
    .subscribe(log);

  await wait(2_000);

  removed$.next(true);
});

function createRenderer(_ui: MetaTree) {
  const memoized = toMemoTree(_ui);

  function toRenderingTree(ui: MetaTree): Observable<RenderingTree> {
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

  return toRenderingTree(memoized);
}

function createElement(
  factory: TagName | FF,
  props: Props,
  ...children: JSXChildren
): MetaTree {
  const converted = children.map<MetaTree>((child) =>
    typeof child === 'string'
      ? {
          type: ElementType.String,
          factory: child,
        }
      : child
  );

  return { type: ElementType.Object, factory, props, children: converted };
}

function toMemoTree(ui: MetaTree): MemoTree {
  if (ui.type === ElementType.String) {
    return ui;
  }

  const factory = ui.factory;

  if (typeof factory === 'function') {
    return {
      ...ui,
      factory: toMemoFactory(factory),
      original: factory,
      children: ui.children.map(toMemoTree),
    };
  }

  return { ...ui, factory, children: ui.children.map(toMemoTree) };
}

function toMemoFactory(factory: FF): FF {
  const content$ = factory();

  return () => content$.pipe(scan(cache, null as unknown as MemoTree));

  function cache(last: MemoTree | null, next: MetaTree): MemoTree {
    if (last === null) {
      return toMemoTree(next);
    }

    if (next.type === ElementType.String) {
      return next;
    }

    const factory = next.factory;

    if (typeof factory === 'function') {
      assert('original' in last);

      if (last.original === factory) {
        return last;
      }

      assert(false, 'Unhandled');
    }

    if (last.factory === factory) {
      assert('children' in last);

      return {
        ...last,
        children: next.children.map((child, index) =>
          // Turn on undefined index feature
          cache(last.children[index] ?? child, child)
        ),
      };
    }

    return toMemoTree(next);
  }
}

function log(obj: unknown) {
  console.log(JSON.stringify(obj, null, 2));
}
