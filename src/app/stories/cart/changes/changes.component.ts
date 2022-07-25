import { Component, Input } from '@angular/core';
import { ComposableComponent } from '../../../reusables/utils/ComposableComponent';
import { tap } from 'rxjs';
import { useChangesEffect } from '../../../reusables/utils/useChangesEffect';

@Component({
  selector: 'app-changes',
  template: '',
})
export class ChangesComponent extends ComposableComponent {
  @Input() name!: string;
  @Input() address!: string;

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
