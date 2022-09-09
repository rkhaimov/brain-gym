import { BehaviorSubject, map, repeat, timer, withLatestFrom } from 'rxjs';
import { vector, Vector } from './linalg';

console.log(1);

const state$ = new BehaviorSubject<Vector[]>([
  vector([0, 0]),
  vector([0, -1]),
  vector([0, -2]),
  vector([0, -3]),
]);

timer(0, 5_000)
  .pipe(
    withLatestFrom(state$),
    map(([, state]) => {
      const GRID_WIDTH = 100;
      const GRID_HEIGHT = 50;

      const cx = 50;
      const cy = 25;
      return grid(GRID_WIDTH, GRID_HEIGHT, (_x, _y) => {
        const point = state.find(
          (v) => v[0][0] === _x - cx && v[1][0] === cy - _y
        );

        if (point) {
          return 'A';
        }

        return '.';
      });
    })
  )
  .subscribe((canvas) => {
    console.clear();

    console.log(canvas);
  });

function grid(
  width: number,
  height: number,
  draw: (x: number, y: number) => string
): string {
  return new Array(height)
    .fill(0)
    .map((_, y) =>
      new Array(width)
        .fill(0)
        .map((_, x) => draw(x, y))
        .join('')
    )
    .join('\n');
}
