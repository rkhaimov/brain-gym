import { createSpace } from './point/space';
import { WithTransform } from './point/types';
import { assert, Brand } from './utils';

/**
 * Represents a branded type for velocity.
 * Velocity is a non-negative number, measured in meters per second (m/s).
 */
export type Velocity = Brand<number, 'Velocity'>;

/**
 * Creates a Velocity from an ordinary number.
 * Velocity represents the speed of an object in a given direction.
 *
 * @param n - A non-negative number representing the velocity.
 * @returns A branded Velocity value.
 * @throws Error if the input number is negative.
 *
 * @example
 * const velocity = createVelocity(10); // Velocity of 10 m/s
 */
export function createVelocity(n: number): Velocity {
  assert(n >= 0, 'Velocity cannot be negative');

  return n as Velocity;
}

/**
 * Applies a velocity to a DynamicPoint over time, updating its position.
 * The new position is calculated using the formula: Space = Velocity * Time.
 *
 * @param velocity - The velocity to apply, in meters per second (m/s).
 *
 * @example
 * const dp = new DynamicPoint();
 * const velocity = createVelocity(10);
 * const updatedPoint = dp.with(velocityT(velocity)); // Moves the point at 10 m/s
 */
export function velocityT(velocity: Velocity): WithTransform {
  return (point, time) => ({
    ...point,
    space: createSpace(velocity * time),
  });
}
