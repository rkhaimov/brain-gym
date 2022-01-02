import {
  ElementType,
  FF,
  JSXChildren,
  MetaTree,
  Props,
  TagName,
} from './types';

export function createElement(
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
