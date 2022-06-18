import { createField } from './createField';
import './style.css';
import { toElement } from './toElement';
import { clicked } from './clicked';
import { flagged } from './flagged';
import { withStatus } from './withStatus';
import { Point } from './types';
import {
  fromEvent,
  map,
  merge,
  noop,
  race,
  scan,
  startWith,
  Subject,
  switchMap,
  tap,
  timer,
} from 'rxjs';

type Action = {
  type: 'click' | 'flag';
  point: Point;
};

const clicks$ = new Subject<Point>();
const flags$ = new Subject<Point>();

const FIELD = createField({ height: 9, width: 9 });

merge(
  clicks$.pipe(map((point): Action => ({ type: 'click', point }))),
  flags$.pipe(map((point): Action => ({ type: 'flag', point })))
)
  .pipe(
    scan(
      (field, action) =>
        action.type === 'click'
          ? clicked(field, action.point)
          : flagged(field, action.point),
      FIELD
    ),
    map(withStatus),
    startWith(FIELD),
    map((field) =>
      toElement(field, (cell, point) => {
        fromEvent(cell, 'mousedown')
          .pipe(
            switchMap(() =>
              race(
                fromEvent(cell, 'mouseup').pipe(tap(() => clicks$.next(point))),
                timer(500).pipe(tap(() => flags$.next(point)))
              )
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
