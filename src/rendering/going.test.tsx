import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
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
import { noop } from 'lodash-es';

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

  createRenderer(ui).pipe(map((value, index) => {
    if (index === 0) {
      // @ts-ignore
      setTimeout(() => value.children[0].listeners.click(), 100);
    }

    return value;
  })).subscribe(log);

  await wait(1_000);

  removed$.next(true);
});

function createRenderer(ui: MetaTree) {
  const memo: MemoTree = resolve(ui, undefined);

  function resolve(next: MetaTree, curr: MemoTree | undefined): MemoTree {
    if (curr) {
      if (next.type === ElementType.String) {
        return next;
      }

      if (typeof next.factory === 'string') {
        if (next.factory === curr.factory) {
          assert('children' in curr);

          return {
            ...curr,
            children: next.children.map((child, index) =>
              resolve(child, curr.children[index])
            ),
          };
        }
      }

      if (typeof next.factory === 'function') {
        if (next.factory === curr.factory) {
          return curr;
        }
      }
    }

    if (next.type === ElementType.String) {
      return next;
    }

    if (typeof next.factory === 'function') {
      return {
        ...next,
        last: next
          .factory()
          .pipe(map(createLastMemoized((last, meta) => resolve(meta, last)))),
        children: next.children.map(
          createLastMemoized((last, meta) => resolve(meta, last))
        ),
      };
    }

    return {
      ...next,
      children: next.children.map(
        createLastMemoized((last, meta) => resolve(meta, last))
      ),
    };
  }

  function toRenderingTree(memo: MemoTree): Observable<RenderingTree> {
    if (memo.type === ElementType.String) {
      return of(memo.factory);
    }

    const factory = memo.factory;

    if (typeof factory === 'function') {
      assert(memo.last);

      return memo.last.pipe(switchMap(toRenderingTree));
    }

    return combineLatest(memo.children.map(toRenderingTree)).pipe(
      map((children) => {
        return {
          tag: factory,
          listeners: propsToListeners(memo.props),
          attributes: propsToAttributes(memo.props),
          children,
        };
      })
    );
  }

  return toRenderingTree(memo);
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

function createLastMemoized<TLast, TArgs extends any[]>(
  clb: (last: TLast | undefined, ...args: TArgs) => TLast
) {
  let last: TLast;

  return (...args: TArgs) => {
    last = clb(last, ...args);

    return last;
  };
}

function log(obj: unknown) {
  console.log(JSON.stringify(obj, null, 2));
}
