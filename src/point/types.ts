import { Mass } from './mass';
import { Stop, Time, TimeTicker } from '../ticker/types';

import { Space } from './space';

/**
 * Represents a point in space with negligible size.
 * A point has a position in space and a mass.
 */
export type Point = {
  /**
   * The distance the point has traveled from the origin, measured in meters (m).
   */
  space: Space;

  /**
   * The mass of the point, measured in kilograms (kg).
   */
  mass: Mass;
};

/**
 * Represents a point that changes over time.
 * A DynamicPoint can be transformed by applying a series of transformations
 * and can be simulated over time using a time ticker.
 */
export type DynamicPoint = {
  /**
   * Applies a transformation to the point.
   * The transformation is a function that takes the current state of the point
   * and the current time, and returns a new state for the point.
   *
   * @param transform - The transformation function to apply.
   * @returns The updated DynamicPoint.
   */
  with(transform: WithTransform): DynamicPoint;

  /**
   * Starts the simulation of the point over time.
   * The simulation is driven by a time ticker, which triggers updates at regular intervals.
   * On each update, the current state of the point is passed to the provided callback.
   *
   * @param ticker - The time ticker that drives the simulation.
   * @param onUpdate - A callback function that receives the updated state of the point.
   */
  start(ticker: TimeTicker, onUpdate: (point: Point) => void): Stop;
};

/**
 * A transformation function that updates the state of a point based on the current time.
 * It can return either:
 * - A new `Point` object representing the updated state, or
 * - Another `WithTransform` function for chaining or conditional transformations.
 */
export type WithTransform = (point: Point, time: Time) => Point | WithTransform;
