import { Observable } from 'rxjs';

export type VirtualElement = string | VirtualNode;

export type VirtualNode = {
  type: string;
  attributes: Record<string, unknown>;
  children: VirtualElement[];
  _ref?: HTMLElement;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: { className?: Observable<string> };
      a: { className?: Observable<string>; onClick?(): void };
      span: { className?: Observable<string> };
      input: {
        type?: Observable<string>;
        placeholder?: Observable<string>;
        onInput?(event: InputEvent & { target: HTMLInputElement }): void;
      };
      h1: {};
      h2: {};
      button: { onClick?(): void };
    }

    interface Element extends Observable<VirtualNode> {}
  }
}
