import { assert, Brand } from '../utils';

/**
 * A function that stops the time ticker when called.
 */
export type Stop = () => void;

/**
 * Represents a time ticker that triggers updates at regular intervals.
 * The ticker can be started and stopped dynamically.
 */
export type TimeTicker = {
  /**
   * Starts the ticker and registers a callback to be called on each tick of the timer.
   *
   * @param handle - A callback function that receives the current time on each tick.
   * @returns A `Stop` function that can be called to stop the ticker.
   *
   * @example
   * const stop = ticker.start((time) => {
   *   console.log(`Current time: ${time} seconds`);
   * });
   *
   * // Stop the ticker after 5 seconds
   * setTimeout(stop, 5_000);
   */
  start(handle: (time: Time) => void): Stop;
};

/**
 * Represents a branded type for time.
 * Time is a non-negative number, measured in seconds.
 */
export type Time = Brand<number, 'Time'>;

/**
 * Creates a Time from an ordinary number.
 * Time represents the duration in seconds.
 *
 * @param n - A non-negative number representing the time.
 * @returns A branded Time value.
 * @throws Error if the input number is negative.
 *
 * @example
 * const time = createTime(5); // Time of 5 seconds
 */
export function createTime(n: number): Time {
  assert(n >= 0, 'Time cannot be negative');
  return n as Time;
}
