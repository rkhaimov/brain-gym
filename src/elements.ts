import { combineLatest, map, Observable, Observer, of, switchMap } from 'rxjs';

function createElement(type: string, props: Props): Observable<VirtualObject> {
  if (props.children.length === 0) {
    return of({ type, attributes: {}, children: [] });
  }

  return combineLatest(props.children).pipe(
    map((children) => ({ type, attributes: {}, children }))
  );
}

export function createDiv(props: Props): Observable<VirtualElement> {
  return createElement('div', props);
}

export function createH1(props: Props): Observable<VirtualElement> {
  return createElement('h1', props);
}

export function createH2(props: Props): Observable<VirtualElement> {
  return createElement('h2', props);
}

export function createSpan(
  props: Props<{ className: string }>
): Observable<VirtualElement> {
  return createElement('span', props).pipe(
    switchMap((element) => {
      return props.className.pipe(
        map((cn) => {
          element.attributes['class'] = cn;

          return element;
        })
      );
    })
  );
}

export function createInput(
  props: Props & Handlers<{ onInput: string }>
): Observable<VirtualElement> {
  return createElement('input', props).pipe(
    map((element) => {
      element.attributes['onInput'] = (e: InputEvent) =>
        props.onInput.next((e.target as HTMLInputElement).value);

      return element;
    })
  );
}

export type VirtualElement = string | VirtualObject;

export type VirtualObject = {
  type: string;
  attributes: Record<string, unknown>;
  children: VirtualElement[];
  _ref?: HTMLElement;
};

type Props<TData extends Record<string, unknown> = {}> = {
  [key in keyof TData]: Observable<TData[key]>;
} & {
  children: Observable<VirtualElement>[];
};

type Handlers<THandlers extends Record<string, unknown>> = {
  [key in keyof THandlers]: Observer<THandlers[key]>;
};
