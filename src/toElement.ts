import { Field, Point } from './types';
import { assert, not } from './utils';
import { selectMines } from './mine';
import { selectFlagged } from './flagged';

export function toElement(
  field: Field,
  toIntractable: (cell: HTMLElement, point: Point) => HTMLElement
): HTMLElement {
  const game = document.createElement('div');

  const status = document.createElement('div');
  const left = selectMines(field.cells).size - selectFlagged(field.cells).size;
  status.innerText = `Status: ${field.status}, Mines: ${left}`;

  game.appendChild(status);

  const container = document.createElement('div');

  container.classList.add('container');
  container.style.gridTemplateColumns = `repeat(${field.width}, 60px)`;

  const elements = Array.from(field.cells.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([point, cell]): HTMLElement => {
      const element = document.createElement('div');

      element.classList.add('point');

      if (cell.flagged) {
        element.classList.add('flagged');

        return toIntractable(element, point);
      }

      if (not(cell.shown)) {
        element.classList.add('hidden');

        return toIntractable(element, point);
      }

      if (cell.kind === 'mine') {
        element.classList.add('mine');

        return element;
      }

      assert(cell.kind === 'suggest');

      element.classList.add('suggest');
      element.innerText = cell.score === 0 ? '' : `${cell.score}`;

      return element;
    });

  elements.forEach((element) => container.appendChild(element));
  game.appendChild(container);

  return game;
}
