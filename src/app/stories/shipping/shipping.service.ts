import { Injectable } from '@angular/core';
import { ComposableService } from '../../reusables/utils/ComposableService';
import { useEffect } from '../../reusables/utils/useEffect';
import { concatMap, from, map, Observable, timer } from 'rxjs';

@Injectable()
export class ShippingService extends ComposableService {
  numbers$ = from([1, 2, 3]).pipe(
    concatMap((n) => this._timer(3_000).pipe(map(() => n)))
  );

  constructor(private _timer: (ms: number) => Observable<number> = timer) {
    super();

    this.compose(
      useEffect(() => {
        console.log('ShippingService loaded!');

        return () => console.log('ShippingService destroyed!');
      })
    );
  }
}
