export type Point = {
  tag: 'point';
  x: number;
  y: number;
};

export type Line = {
  tag: 'line';
  from: Point;
  to: Point;
};

export type Circle = {
  tag: 'circle';
  center: Point;
  radius: number;
};

export type Shape = Point | Circle | Line;
