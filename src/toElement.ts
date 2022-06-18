import { Point, StatusFlagsShownSuggestedField } from './types';
import { hasPoint, lookupPoint } from './point';
import { allPointsInSpace } from './allPointsInSpace';

export function toElement(
  field: StatusFlagsShownSuggestedField,
  toIntractable: (cell: HTMLElement, point: Point) => HTMLElement
): HTMLElement {
  const container = document.createElement('div');

  if (field.status === 'win') {
    container.innerText = 'WIN';

    return container;
  }

  if (field.status === 'lost') {
    container.innerText = 'LOST';

    return container;
  }

  container.classList.add('container');
  container.style.gridTemplateColumns = `repeat(${field.width}, 60px)`;

  const cells: HTMLElement[] = allPointsInSpace(field).map(
    (point): HTMLElement => {
      const cell = document.createElement('div');

      cell.classList.add('point');

      if (hasPoint(field.flags, point)) {
        cell.classList.add('flagged');

        return toIntractable(cell, point);
      }

      if (hasPoint(field.shown, point) === false) {
        cell.classList.add('hidden');

        return toIntractable(cell, point);
      }

      if (hasPoint(field.mines, point)) {
        cell.classList.add('mine');

        return cell;
      }

      if (hasPoint(field.suggestions, point)) {
        cell.classList.add('suggest');

        const suggest = lookupPoint(field.suggestions, point);

        cell.innerText = `${suggest}`;

        return cell;
      }

      return cell;
    }
  );

  cells.map((cell) => container.appendChild(cell));

  return container;
}
