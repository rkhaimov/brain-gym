import { assert, Brand } from '../utils';

export type Mass = Brand<number, 'Mass'>;

/**
 * Creates mass from ordinary number.
 *
 * @throws Error when parameter is less or equal to zero.
 */
export function createMass(n: number): Mass {
  assert(n > 0, 'Object mass can only be positive');

  return n as Mass;
}
