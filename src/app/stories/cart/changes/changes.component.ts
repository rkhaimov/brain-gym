import { Component, Input } from '@angular/core';
import { ComposableComponent } from '../../../reusables/utils/ComposableComponent';
import { tap } from 'rxjs';
import { useChangesEffect } from '../../../reusables/utils/useChangesEffect';

@Component({
  selector: 'app-changes',
  template: `
    <div>
      <h1>{{ swapped ? name : address }}</h1>
      <p>{{ swapped ? address : name }}</p>
      <button (click)="swapped = !swapped">Reorder</button>
    </div>
  `,
})
export class ChangesComponent extends ComposableComponent {
  @Input() name!: string;
  @Input() address!: string;

  swapped = false;

  constructor() {
    super();

    this.compose(
      useChangesEffect(
        (changes$) =>
          changes$.pipe(
            tap(([name, address]) => console.log({ name, address }))
          ),
        this,
        ['name', 'address']
      )
    );
  }
}
