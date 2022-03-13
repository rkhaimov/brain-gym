import {
  BehaviorSubject,
  exhaustMap,
  filter,
  fromEvent,
  map,
  mapTo,
  merge,
  Observable,
  of,
  partition,
  scan,
  switchMap,
  take,
  takeLast,
  takeUntil,
  tap,
} from 'rxjs';
import { id } from './id';

document.body.innerHTML = `<div>
  It is bright new World
  <button id='openSheet'>Open the thing</button>
  <div id='sheet' style='position: fixed; left: 0; right: 0; bottom: 0; top: 0; transition: background-color 0.2s'>
    <div id='sheetContent' style='background-color: white; border-radius: 10px; min-height: 100%; padding: 15px; position: relative; top: 100%; transition: top 0.2s'>
    <div id='sheetGrab' style='width: 100px;
    height: 10px;
    background-color: #000;
    border-radius: 10px;
    margin: 0 auto 15px;'></div>
</div>
  </div>
</div>`;

const sheet = document.querySelector('#sheet') as HTMLDivElement;
const sheetContent = document.querySelector('#sheetContent') as HTMLDivElement;

const openSheet = document.querySelector('#openSheet') as HTMLButtonElement;
const sheetGrab = document.querySelector('#sheetGrab') as HTMLDivElement;

const sheetOpened = new BehaviorSubject(false);

fromEvent(openSheet, 'click').pipe(mapTo(true)).subscribe(sheetOpened);

sheetOpened
  .pipe(
    tap((opened) => {
      if (opened) {
        sheet.style.display = 'block';
      } else {
        sheet.style.display = 'none';
      }
    }),
    filter(id),
    switchMap(() => {
      const top$ = top();

      return merge(grabbing(top$), closing(top$), opacity(top$));
    })
  )
  .subscribe();

sheetOpened.pipe(filter(id));

function grabbing(top$: Observable<number>): Observable<unknown> {
  return top$.pipe(tap((top) => (sheetContent.style.top = `${top}px`)));
}

function closing(top$: Observable<number>): Observable<unknown> {
  return top$.pipe(
    filter((top) => top === sheetContent.getBoundingClientRect().height),
    switchMap(() => fromEvent(sheetContent, 'transitionend').pipe(take(1))),
    tap(() => sheetOpened.next(false))
  );
}

function opacity(top$: Observable<number>): Observable<unknown> {
  return top$.pipe(
    map((top) => top / sheetContent.getBoundingClientRect().height),
    tap(
      (opacity) =>
        (sheet.style.backgroundColor = `rgb(0 0 0 / ${
          Math.min(1 - opacity, 0.8) * 100
        }%)`)
    )
  );
}

function top(): Observable<number> {
  const TOP_OFFSET = 15;

  const moving$ = fromEvent(sheetGrab, 'mousedown').pipe(
    exhaustMap((): Observable<number> => {
      const grab$ = fromEvent<MouseEvent>(sheet, 'mousemove').pipe(
        scan((top, event) => top + event.movementY, TOP_OFFSET),
        filter((top) => top > TOP_OFFSET),
        takeUntil(fromEvent(sheet, 'mouseup'))
      );

      const [keep$, close$] = partition(
        grab$.pipe(takeLast(1)),
        (top) => top < sheetContent.getBoundingClientRect().height / 2
      );

      return merge(
        grab$,
        keep$.pipe(mapTo(TOP_OFFSET)),
        close$.pipe(mapTo(sheetContent.getBoundingClientRect().height))
      );
    })
  );

  // Reimplement using animationFrames and transform
  document.body.offsetTop;

  return merge(of(TOP_OFFSET), moving$);
}
