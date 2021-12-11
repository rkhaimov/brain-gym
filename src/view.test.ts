import {
  fireEvent,
  getAllByRole,
  getByRole,
  prettyDOM,
} from '@testing-library/dom';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { ARIARole } from 'aria-query';
import {
  createDiv,
  createH1,
  createH2,
  createInput,
  createSpan,
  ViewElement,
} from './elements';
import { render } from './render';

test('It allows to sync h1 title and input value', () => {
  const input$ = new BehaviorSubject('');
  const ui$ = createDiv(createH1(input$), createInput(input$));
  const { outputs, dom } = renderAndInspect(ui$);

  // Act
  const input = getByRole(dom, 'textbox' as ARIARole) as HTMLInputElement;

  fireEvent.input(input, { target: { value: 'Hello world' } });

  // Assert
  expect(outputs.join('\n\n')).toMatchSnapshot();
});

test('It allows to create independent pairs', () => {
  function createH1AndInputPair(): Observable<ViewElement> {
    const input$ = new BehaviorSubject('');

    return createDiv(createH1(input$), createInput(input$));
  }

  const ui$ = createDiv(createH1AndInputPair(), createH1AndInputPair());
  const { outputs, dom } = renderAndInspect(ui$);

  const input = getAllByRole(dom, 'textbox' as ARIARole) as HTMLInputElement[];

  fireEvent.input(input[0], { target: { value: 'Hello first world' } });
  fireEvent.input(input[1], { target: { value: 'Hello second world' } });

  expect(outputs.join('\n\n')).toMatchSnapshot();
});

test('It can do branching', () => {
  function createBranched(): Observable<ViewElement> {
    const input$ = new BehaviorSubject('');

    return createDiv(
      input$.pipe(
        switchMap((input) =>
          input.includes('h1') ? createH1(input$) : createH2(input$)
        )
      ),
      createInput(input$)
    );
  }

  const ui$ = createBranched();
  const { outputs, dom } = renderAndInspect(ui$);

  const input = getByRole(dom, 'textbox' as ARIARole) as HTMLInputElement;

  fireEvent.input(input, { target: { value: 'I am h1' } });
  fireEvent.input(input, { target: { value: 'I am h2' } });

  expect(outputs.join('\n\n')).toMatchSnapshot();
});

test('It can change attributes', () => {
  function createWithClassNames() {
    const input$ = new BehaviorSubject('');

    return createDiv(createSpan(input$, input$), createInput(input$));
  }

  const ui$ = createWithClassNames();
  const { outputs, dom } = renderAndInspect(ui$);

  const input = getByRole(dom, 'textbox' as ARIARole) as HTMLInputElement;

  fireEvent.input(input, { target: { value: 'Class name is changing' } });

  expect(outputs.join('\n\n')).toMatchSnapshot();
});

function renderAndInspect(element: Observable<ViewElement>) {
  const outputs: string[] = [];
  const dom = document.createElement('main');

  element.subscribe((ui) => {
    outputs.push(prettyDOM(render(ui, dom)) as string);
  });

  return { outputs, dom };
}
