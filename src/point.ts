import { Point } from './types';

export function createPoint(x: number, y: number): Point {
  return `${x}X${y}`;
}

export function getX(point: Point): number {
  return parseInt(point.split('X')[0]);
}

export function getY(point: Point): number {
  return parseInt(point.split('X')[1]);
}
