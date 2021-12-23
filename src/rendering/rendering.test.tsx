import {
  fireEvent,
  getByRole,
  getByText,
  prettyDOM,
} from '@testing-library/dom';
import { ARIARole } from 'aria-query';
import { times } from 'lodash-es';
import { BehaviorSubject, Observable, of, Subject, switchMap } from 'rxjs';
import { wait } from '../utils';
import { byFrame } from './byFrame';
import { createRenderer } from './render';
import { VirtualElement } from '../../global';
import { createElement } from './createElement';

test('It allows to sync h1 title and input value', async () => {
  const input$ = new BehaviorSubject('');

  const ui$ = (
    <div>
      <h1>{input$}</h1>
      <input onInput={(value) => input$.next(value.target.value)} />
    </div>
  );

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

  const ui$ = (
    <div>
      {input$.pipe(
        switchMap((input) =>
          input.includes('H1') ? <h1>{input}</h1> : <h2>{input}</h2>
        )
      )}
    </div>
  );

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

  const ui$ = (
    <div>
      <span className={input$}>{input$}</span>
      <input
        type={of('text')}
        onInput={(value) => input$.next(value.target.value)}
      />
    </div>
  );

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
  const input$ = new BehaviorSubject(0);

  const ui$ = input$.pipe(
    switchMap((count) => (
      <div>
        {times(count, (index) => (
          <h1>{`${index}`}</h1>
        ))}
      </div>
    ))
  );

  const rendered = renderAndInspect(ui$);
  await wait(100);

  input$.next(2);
  await wait(100);

  input$.next(1);
  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

test('It can update contents of specific child', async () => {
  const input$ = new BehaviorSubject('off');

  const ui$ = input$.pipe(
    switchMap((input) => {
      if (input === 'on') {
        return (
          <div>
            <h1>0</h1>
            <h1>
              <div>1</div>
            </h1>
          </div>
        );
      }

      return (
        <div>
          <h1>0</h1>
          <h1>1</h1>
        </div>
      );
    })
  );

  const rendered = renderAndInspect(ui$);
  await wait(100);

  input$.next('on');
  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

test('It can update type of specific child', async () => {
  const input$ = new BehaviorSubject('off');

  const ui$ = input$.pipe(
    switchMap((input) => {
      if (input === 'on') {
        return (
          <div>
            <div>0</div>
            <h1>1</h1>
            <div>2</div>
          </div>
        );
      }

      return (
        <div>
          <h1>0</h1>
          <h1>1</h1>
          <h1>2</h1>
        </div>
      );
    })
  );

  const rendered = renderAndInspect(ui$);
  await wait(100);

  input$.next('on');
  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

test('It can update attributes of specific child', async () => {
  const input$ = new BehaviorSubject('off');

  const ui$ = input$.pipe(
    switchMap((input) => {
      if (input === 'on') {
        return (
          <div>
            <span className={of('0-on')}>0-on</span>
            <span className={of('1')}>1</span>
            <span>2</span>
            <span className={of('3-on')}>3-on</span>
          </div>
        );
      }

      return (
        <div>
          <span className={of('0-off')}>0-off</span>
          <span className={of('1')}>1</span>
          <span className={of('2')}>2</span>
          <span className={of('3-off')}>3-off</span>
        </div>
      );
    })
  );

  const rendered = renderAndInspect(ui$);
  await wait(100);

  input$.next('on');
  await wait(100);

  expect(rendered.output).toMatchSnapshot();
});

test('It can update callbacks', async () => {
  const input$ = new BehaviorSubject('off');
  const callback$ = new Subject<string>();
  const clicks = jest.fn();
  callback$.subscribe(clicks);

  const ui$ = input$.pipe(
    switchMap((input) => {
      if (input === 'on') {
        return (
          <div>
            <a onClick={() => callback$.next('1')}>1</a>
          </div>
        );
      }

      return (
        <div>
          <a onClick={() => callback$.next('0')}>0</a>
          <a onClick={() => callback$.next('1')}>1</a>
        </div>
      );
    })
  );

  const rendered = renderAndInspect(ui$);
  await wait(100);

  fireEvent(getByText(rendered.dom, '0'), new MouseEvent('click'));
  fireEvent(getByText(rendered.dom, '1'), new MouseEvent('click'));

  input$.next('on');
  await wait(100);

  fireEvent(getByText(rendered.dom, '1'), new MouseEvent('click'));

  expect(clicks.mock.calls).toMatchSnapshot();
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
