import { createField } from './createField';
import './style.css';
import { toElement } from './toElement';
import { withSuggestions } from './withSuggestions';
import { withShown } from './withShown';
import { withFlags } from './withFlags';
import { withStatus } from './withStatus';
import { Point } from './types';
import {
  combineLatest,
  fromEvent,
  map,
  mapTo,
  noop,
  race,
  scan,
  startWith,
  Subject,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { points } from './point';

const clicks$ = new Subject<Point>();
const flags$ = new Subject<Point>();

const field = createField({ height: 15, width: 9 });

combineLatest([
  clicks$.pipe(
    scan((clicks, click) => clicks.add(click), points([])),
    startWith(points([]))
  ),
  flags$.pipe(
    scan((flags, flag) => {
      if (flags.has(flag)) {
        flags.delete(flag);

        return flags;
      }

      return flags.add(flag);
    }, points([])),
    startWith(points([]))
  ),
])
  .pipe(
    map(([clicks, flags]) =>
      withStatus(
        withFlags(
          withShown(withSuggestions(field), Array.from(clicks)),
          Array.from(flags)
        ),
        Array.from(clicks),
        Array.from(flags)
      )
    ),
    tap((field) => console.log(field.status)),
    map((field) =>
      toElement(field, (cell, point) => {
        fromEvent(cell, 'mousedown')
          .pipe(
            switchMap(() =>
              race(
                fromEvent(cell, 'mouseup').pipe(mapTo('click')),
                timer(500).pipe(mapTo('flag'))
              )
            ),
            tap((kind) =>
              kind === 'click' ? clicks$.next(point) : flags$.next(point)
            )
          )
          .subscribe(noop);

        return cell;
      })
    )
  )
  .subscribe((element) => {
    document.body.innerHTML = '';
    document.body.appendChild(element);
  });
