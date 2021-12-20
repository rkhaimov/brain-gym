import { fireEvent, getByRole, prettyDOM } from '@testing-library/dom';
import { ARIARole } from 'aria-query';
import { times } from 'lodash-es';
import { BehaviorSubject, map, Observable, of, switchMap } from 'rxjs';
import { byFrame } from './byFrame';
import {
  createDiv,
  createH1,
  createH2,
  createInput,
  createSpan,
  VirtualElement,
} from './elements';
import { createRenderer } from './render';
import { wait } from './repository';

test('It allows to sync h1 title and input value', async () => {
  const input$ = new BehaviorSubject('');
  const ui$ = createDiv({
    children: [
      createH1({ children: [input$] }),
      createInput({ onInput: input$, children: [] }),
    ],
  });
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

  const ui$ = createDiv({
    children: [
      input$.pipe(
        switchMap((input) =>
          input.includes('H1')
            ? createH1({ children: [of(input)] })
            : createH2({ children: [of(input)] })
        )
      ),
    ],
  });

  const rendered = renderAndInspect(ui$);
  await wait(100);

  // Act
  input$.next('H1');
  await wait(100);

  input$.next('H2');
  await wait(100);

  // Assert
  expect(rendered.output).toMatchSnapshot();
});

test('It allows to change element attribute', async () => {
  // Arrange
  const input$ = new BehaviorSubject('');

  const ui$ = createDiv({
    children: [
      createSpan({ children: [input$], className: input$ }),
      createInput({ onInput: input$, children: [] }),
    ],
  });

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

test('It can remove or add child', async () => {
  const input$ = new BehaviorSubject('0');

  const ui$ = createDiv({
    children: [
      input$.pipe(
        map((value) => parseInt(value)),
        switchMap((count) =>
          createDiv({
            children: times(count, (index) =>
              createH1({ children: [of(`${index}`)] })
            ),
          })
        )
      ),
    ],
  });

  const rendered = renderAndInspect(ui$);
  await wait(100);

  input$.next('2');
  await wait(100);

  input$.next('1');
  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

test('It can update contents of specific child', async () => {
  const input$ = new BehaviorSubject('off');

  const ui$ = createDiv({
    children: [
      input$.pipe(
        switchMap((input) => {
          if (input === 'on') {
            return createDiv({
              children: [
                createH1({ children: [of('0')] }),
                createH1({
                  children: [
                    createDiv({
                      children: [of('1')],
                    }),
                  ],
                }),
              ],
            });
          }

          return createDiv({
            children: [
              createH1({ children: [of('0')] }),
              createH1({
                children: [of('1')],
              }),
            ],
          });
        })
      ),
    ],
  });

  const rendered = renderAndInspect(ui$);
  await wait(100);

  input$.next('on');
  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

test('It can update type of specific child', async () => {
  const input$ = new BehaviorSubject('off');

  const ui$ = createDiv({
    children: [
      input$.pipe(
        switchMap((input) => {
          if (input === 'on') {
            return createDiv({
              children: [
                createDiv({
                  children: [of('0')],
                }),
                createH1({ children: [of('1')] }),
                createDiv({
                  children: [of('2')],
                }),
              ],
            });
          }

          return createDiv({
            children: [
              createH1({ children: [of('0')] }),
              createH1({ children: [of('1')] }),
              createH1({
                children: [of('2')],
              }),
            ],
          });
        })
      ),
    ],
  });

  const rendered = renderAndInspect(ui$);
  await wait(100);

  input$.next('on');
  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

test('It can update attributes of specific child', async () => {
  const input$ = new BehaviorSubject('off');

  const ui$ = createDiv({
    children: [
      input$.pipe(
        switchMap((input) => {
          if (input === 'on') {
            return createDiv({
              children: [
                createSpan({
                  className: of('0-on'),
                  children: [of('0-on')],
                }),
                createSpan({ className: of('1'), children: [of('1')] }),
                createSpan({
                  className: of('2-on'),
                  children: [of('2-on')],
                }),
              ],
            });
          }

          return createDiv({
            children: [
              createSpan({
                className: of('0-off'),
                children: [of('0-off')],
              }),
              createSpan({ className: of('1'), children: [of('1')] }),
              createSpan({
                className: of('2-off'),
                children: [of('2-off')],
              }),
            ],
          });
        })
      ),
    ],
  });

  const rendered = renderAndInspect(ui$);
  await wait(100);

  input$.next('on');
  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

function renderAndInspect(element: Observable<VirtualElement>) {
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
