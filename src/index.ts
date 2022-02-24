import { circle, line, lineIntr, point } from './constructors';
import { createDrawer } from './render';
import { Animation } from './animation';

const { draw, clear } = createDrawer();

Animation.range(0, 100)
  .map((x) => [
    line(point(0, x), point(x + 10, 10)),
    line(point(x + 100, 0), point(x - 100, 10)),
  ])
  .optionalMap(([a, b]) => lineIntr(a, b))
  .map((intr) => circle(intr, 100))
  .animate((circle) => {
    clear();

    draw(circle);
  });
