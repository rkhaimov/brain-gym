import { Component } from '@angular/core';
import { concatMap, delay, from, map, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  date = new Date(1996, 5, 15);
  condition = false;

  nullable: string | null | undefined = 'nullable';

  numbers$ = from([1, 2, 3]).pipe(
    concatMap((n) => timer(3_000).pipe(map(() => n)))
  );
}
