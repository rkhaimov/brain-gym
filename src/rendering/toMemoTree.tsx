import { ElementType, FF, MemoTree, MetaTree } from './types';
import { map } from 'rxjs';
import { assert } from '../utils';

export function toMemoTree(ui: MetaTree): MemoTree {
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
  // Try to reimplement using scan()
  let last: MemoTree | undefined;
  const content$ = factory().pipe(
    map((next) => {
      last = cache(last, next);

      return last;
    })
  );

  return () => content$;

  function cache(last: MemoTree | undefined, next: MetaTree): MemoTree {
    if (last === undefined) {
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
