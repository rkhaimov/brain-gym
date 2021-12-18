import { fireEvent, getByRole, prettyDOM } from '@testing-library/dom';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { ARIARole } from 'aria-query';
import {
  createDiv,
  createH1,
  createH2,
  createInput,
  createSpan,
  ViewElement,
} from './elements';
import { byFrame, createRenderer } from './render';
import { wait } from './repository';

test('It allows to sync h1 title and input value', async () => {
  const input$ = new BehaviorSubject('');
  const ui$ = createDiv(createH1(input$), createInput(input$));
  const rendered = renderAndInspect(ui$);
  await wait(100);

  // Act
  const input = getByRole(
    rendered.dom,
    'textbox' as ARIARole
  ) as HTMLInputElement;

  fireEvent.input(input, { target: { value: 'Hello world' } });
  await wait(100);

  // Assert
  expect(rendered.output).toMatchSnapshot();
});

test('It allows to change element type', async () => {
  // Arrange
  const input$ = new BehaviorSubject('');

  const ui$ = createDiv(
    input$.pipe(
      switchMap((input) =>
        input.includes('H1') ? createH1(of(input)) : createH2(of(input))
      )
    ),
    createInput(input$)
  );

  const rendered = renderAndInspect(ui$);
  await wait(100);

  // Act
  const input = getByRole(
    rendered.dom,
    'textbox' as ARIARole
  ) as HTMLInputElement;

  fireEvent.input(input, { target: { value: 'H1' } });
  await wait(100);

  fireEvent.input(input, { target: { value: 'H2' } });
  await wait(100);

  // Assert
  expect(rendered.output).toMatchSnapshot();
});

test('It allows to change element attribute', async () => {
  // Arrange
  const input$ = new BehaviorSubject('');

  const ui$ = createDiv(createSpan(input$, input$), createInput(input$));
  const rendered = renderAndInspect(ui$);

  await wait(100);

  // Act
  const input = getByRole(
    rendered.dom,
    'textbox' as ARIARole
  ) as HTMLInputElement;

  fireEvent.input(input, { target: { value: 'Hello' } });

  await wait(100);

  fireEvent.input(input, { target: { value: 'World' } });

  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

function renderAndInspect(element: Observable<ViewElement>) {
  let outputs: string[] = [];
  const dom = document.createElement('main');
  const render = createRenderer();

  const subscription = element.pipe(byFrame()).subscribe((ui) => {
    try {
      outputs.push(prettyDOM(render(ui, dom)) as string);
    } catch (e: unknown) {
      outputs = [(e as Error).message];

      subscription.unsubscribe();
    }
  });

  return {
    get output() {
      return outputs.join('\n\n');
    },
    dom,
  };
}
