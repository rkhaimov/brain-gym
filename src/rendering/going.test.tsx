import { BehaviorSubject, map } from 'rxjs';
import { FF, MetaTree, RenderingTree } from './types';
import { wait } from '../utils';
import { toRenderingTree } from './toRenderingTree';
import { toDOM } from './toDOM';
import { findAllByRole, findByRole, logDOM, prettyDOM } from '@testing-library/dom';
import { toMemoTree } from './toMemoTree';
import { createElement } from './createElement';
import userEvent from '@testing-library/user-event';
import { first } from 'lodash-es';

test('It persists state based on type only', async () => {
  const Toggle: FF = () => {
    const toggled$ = new BehaviorSubject(false);

    return toggled$.pipe(
      map((toggled) =>
        createElement(
          'button',
          { onClick: () => toggled$.next(!toggled) },
          toggled ? 'Toggled' : 'Untoggled'
        )
      )
    );
  };

  const ui = createElement(() => {
    const removed$ = new BehaviorSubject(false);

    return removed$.pipe(
      map((removed) => {
        if (removed) {
          return createElement(
            'div',
            null,
            createElement('button', { onClick: () => removed$.next(true) }, 'Remove'),
            createElement(Toggle, null)
          );
        }

        return createElement(
          'div',
          null,
          createElement('button', { onClick: () => removed$.next(true) }, 'Remove'),
          createElement(Toggle, null),
          createElement(Toggle, null)
        );
      })
    );
  }, null);

  const observableUI = renderObservable(ui);
  const outputs = [];

  outputs.push(observableUI.output);

  await observableUI.act(async () => {
    const button = (await findAllByRole(observableUI.container, 'button'))[1];

    userEvent.click(button);
  });

  outputs.push(observableUI.output);

  await observableUI.act(async () => {
    const button = (await findAllByRole(observableUI.container, 'button'))[0];

    userEvent.click(button);
  });

  outputs.push(observableUI.output);

  console.log(outputs.join('\n\n'));
});

function renderObservable(_ui: MetaTree) {
  const memoized = toMemoTree(_ui);

  const container = document.createElement('main');
  let curr: RenderingTree | undefined;
  toRenderingTree(memoized).subscribe((next) => {
    try {
      curr = toDOM(curr, next, container);
    } catch (e) {
      console.log(e);
    }
  });

  return {
    get output() {
      return prettyDOM(container);
    },
    async act(clb: () => unknown) {
      document.body.appendChild(container);

      await clb();

      document.body.removeChild(container);
    },
    container,
  };
}
