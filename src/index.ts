import { accelerationT, createAcceleration } from './acceleration';
import { createDynamicPoint } from './point';
import { createMass } from './point/mass';
import { createSpace } from './point/space';
import { Point } from './point/types';
import { onEachSecondTicker } from './ticker/on-each-second-ticker';

const point: Point = {
  mass: createMass(1),
  space: createSpace(0),
};

createDynamicPoint(point)
  .with(accelerationT(createAcceleration(2)))
  .start(onEachSecondTicker, (point) => {
    console.log(`Point position: ${point.space} meters`);
  });
