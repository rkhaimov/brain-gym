import { Component, Input } from '@angular/core';
import { tap } from 'rxjs';
import { ComposableComponent } from '../reusables/ComposableComponent';
import { useEffect } from '../reusables/useEffect';

@Component({
  selector: 'app-changes',
  templateUrl: './changes.component.html',
})
export class ChangesComponent extends ComposableComponent {
  @Input() name?: string;
  @Input() address?: string;

  constructor() {
    super();

    this.compose(
      useEffect(
        (changes$) => changes$.pipe(tap(console.log)),
        ChangesComponent,
        'name'
      )
    );
  }
}
