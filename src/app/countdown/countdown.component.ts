import { Component } from '@angular/core';
import { ComposableComponent } from '../reusables/ComposableComponent';
import {
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap,
  timer,
  withLatestFrom,
} from 'rxjs';
import { createStorage } from '../reusables/createStorage';
import { useObservable } from '../reusables/useObservable';

type State = { left: number; running: boolean };

type AsyncUpdater = (state: State) => Observable<State>;

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
})
export class CountdownComponent extends ComposableComponent {
  start = new Subject<void>();
  stop = new Subject<void>();
  storage = createStorage<State>({ left: 10, running: false });

  constructor() {
    super();

    this.compose(
      useObservable(() =>
        merge(this.start$(), this.stop$()).pipe(
          withLatestFrom(this.storage.state$),
          switchMap(([updater, state]) => updater(state)),
          tap((state) => this.storage.update(() => state))
        )
      )
    );
  }

  start$ = (): Observable<AsyncUpdater> =>
    this.start.pipe(
      map(
        () =>
          ({ left }) =>
            timer(0, 1_000).pipe(
              take(left),
              map((ticks) => ({ left: left - ticks, running: true }))
            )
      )
    );

  stop$ = (): Observable<AsyncUpdater> =>
    this.stop.pipe(map(() => (state) => of({ ...state, running: false })));
}
