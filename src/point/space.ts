import { assert, Brand } from '../utils';

/**
 * Represents a branded type for space (distance).
 * Space is a non-negative number, measured in meters (m).
 */
export type Space = Brand<number, 'Space'>;

/**
 * Creates a Space from an ordinary number.
 * Space represents the distance in meters.
 *
 * @param n - A non-negative number representing the distance.
 * @returns A branded Space value.
 * @throws Error if the input number is negative.
 *
 * @example
 * const space = createSpace(100); // Space of 100 meters
 */
export function createSpace(n: number): Space {
  assert(n >= 0, 'Space cannot be negative');

  return n as Space;
}
