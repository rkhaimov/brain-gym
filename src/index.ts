import * as IO from './io';
import { flow } from './flow';

const ioWindow = (): IO.IO<Window> => IO.io(() => window);

const locationParts: () => IO.IO<string[]> = flow(
  ioWindow,
  IO.map((window) => window.location),
  IO.map((location) => location.href),
  IO.map((href) => href.split(' '))
);

IO.unsafeRun(locationParts());
