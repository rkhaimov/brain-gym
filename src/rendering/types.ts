// Basic element can be string or StateTree$
import { Observable } from 'rxjs';

export type FF = () => Observable<MetaTree>;
export type TagName = keyof HTMLElementTagNameMap;

// Props for now are string, func or null
export type Props = Record<string, string | (() => void)> | null;

export enum ElementType {
  String,
  Object,
}

export type MetaTree =
  | { type: ElementType.String; factory: string }
  | {
      type: ElementType.Object;
      factory: TagName | FF;
      props: Props;
      children: MetaTree[];
    };

export type JSXChildren = Array<string | MetaTree>;

export type MemoTree =
  | Extract<MetaTree, { type: ElementType.String }>
  | (Extract<MetaTree, { type: ElementType.Object }> & {
      children: MemoTree[];
      last?: Observable<MemoTree>;
    });

// Rendering requires information related to DOM
export type RenderingTree =
  | string
  | {
      tag: string;
      attributes: Attributes;
      listeners: Listeners;
      children: RenderingTree[];
    };

export type Attributes = Record<string, string>;
export type Listeners = Record<string, () => unknown>;
