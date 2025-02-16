import { createSpace, Space } from './point/space';
import { WithTransform } from './point/types';
import { assert, Brand } from './utils';
import { createVelocity, velocityT } from './velocity';

export type Acceleration = Brand<number, 'Acceleration'>;

/**
 * Creates an Acceleration from an ordinary number.
 * Acceleration represents the rate of change of velocity, measured in meters per second squared (m/s²).
 *
 * @param n - A non-negative number representing the acceleration.
 * @returns A branded Acceleration value.
 * @throws Error if the input number is negative.
 *
 * @example
 * const acceleration = createAcceleration(2); // 2 m/s²
 */
export function createAcceleration(n: number): Acceleration {
  assert(n >= 0, 'Acceleration cannot be negative');

  return n as Acceleration;
}

/**
 * Creates a transformation that applies acceleration to a point over time.
 * The position is updated using the formula: Space = (1/2) * Acceleration * Time².
 *
 * @param acceleration - The acceleration to apply, in meters per second squared (m/s²).
 * @returns A `WithTransform` function that applies the acceleration over time.
 *
 * @example
 * const acceleration = createAcceleration(2); // 2 m/s²
 * const dp = createDynamicPoint({ space: createSpace(0), mass: createMass(1) });
 *
 * dp.with(accelerationT(acceleration));
 *
 * dp.start(onEachSecondTicker, (point) => {
 *   console.log(`Point position: ${point.space} meters`);
 * });
 */
export function accelerationT(acceleration: Acceleration): WithTransform {
  return (point, time) => ({
    ...point,
    space: createSpace(((1 / 2) * acceleration * time * time)),
  });
}
