import { combineLatest, map, Observable, Observer, of } from 'rxjs';

export function createDiv(
  ...children: Observable<ViewElement>[]
): Observable<ViewElement> {
  return combineLatest(children).pipe(
    map((children) => ({ type: 'div', attributes: {}, children }))
  );
}

export function createH1(
  title: Observable<ViewElement>
): Observable<ViewElement> {
  return title.pipe(
    map((title) => ({
      type: 'h1',
      attributes: {},
      children: [title],
    }))
  );
}

export function createH2(
  title: Observable<ViewElement>
): Observable<ViewElement> {
  return title.pipe(
    map((title) => ({
      type: 'h2',
      attributes: {},
      children: [title],
    }))
  );
}

export function createSpan(
  text: Observable<ViewElement>,
  classname: Observable<string>
): Observable<ViewElement> {
  return combineLatest([text, classname]).pipe(
    map(([text, classname]) => ({
      type: 'span',
      attributes: {
        'class': classname,
      },
      children: [text],
    }))
  );
}

export function createInput(
  onInput: Observer<string>
): Observable<ViewElement> {
  return of({
    type: 'input',
    attributes: {
      onInput: (e: InputEvent) =>
        onInput.next((e.target as HTMLInputElement).value),
    },
    children: [],
  });
}

export type ViewElement =
  | string
  | {
      type: string;
      attributes: Record<string, unknown>;
      children: ViewElement[];
    };
