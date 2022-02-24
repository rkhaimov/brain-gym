import { Point } from './types';

export const xmin = (): number => (window.innerWidth / 2) * -1;
export const xmax = (): number => window.innerWidth / 2;

export const translate = (point: Point): Point => ({
  tag: 'point',
  x: point.x + window.innerWidth / 2,
  y: window.innerHeight / 2 - point.y,
});
