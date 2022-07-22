import { Component } from '@angular/core';
import { ComposableComponent } from '../reusables/ComposableComponent';
import { map, Observable, of, Subject, take, timer } from 'rxjs';
import { createStorage } from '../reusables/createStorage';
import { useObservable } from '../reusables/useObservable';
import {
  AsyncUpdater,
  bindAsyncUpdaters,
} from '../reusables/bindAsyncUpdaters';

type State = { left: number; running: boolean };

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
})
export class CountdownComponent extends ComposableComponent {
  start = new Subject<void>();
  stop = new Subject<void>();
  private storage = createStorage<State>({ left: 10, running: false });

  constructor() {
    super();

    this.compose(
      useObservable(() =>
        bindAsyncUpdaters([this.start$(), this.stop$()], this.storage)
      )
    );
  }

  timer$ = this.storage.state$;

  private start$ = (): Observable<AsyncUpdater<State>> =>
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

  private stop$ = (): Observable<AsyncUpdater<State>> =>
    this.stop.pipe(map(() => (state) => of({ ...state, running: false })));
}
