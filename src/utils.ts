export function times<TReturn>(
  n: number,
  onTime: (time: number) => TReturn
): TReturn[] {
  const result: TReturn[] = [];

  for (let time = 0; time < n; time += 1) {
    result.push(onTime(time));
  }

  return result;
}

export function linspace(from: number, to: number, steps: number) {
  const step = (to - from) / steps;

  return times(steps, (time) => from + step * time);
}

export function deriv(f: (x: number) => number) {
  const epsilon = Math.pow(10, -5);

  return (x: number) => (f(x + epsilon) - f(x)) / epsilon;
}