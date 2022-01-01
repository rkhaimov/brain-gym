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

export type MemoTree =
  | { type: ElementType.String; factory: string }
  | {
      type: ElementType.Object;
      factory: TagName;
      props: Props;
      children: MemoTree[];
    }
  | {
      type: ElementType.Object;
      factory: FF;
      original: FF;
      props: Props;
      children: MemoTree[];
    };

export type JSXChildren = Array<string | MetaTree>;

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
