import { Component, Input } from '@angular/core';
import { ComposableComponent } from '../reusables/ComposableComponent';
import { FormControl } from '@angular/forms';
import { useObservable } from '../reusables/useObservable';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-changes',
  template: '',
})
export class ChangesComponent extends ComposableComponent {
  @Input() name!: FormControl<string>;
  @Input() address!: FormControl<string>;

  constructor() {
    super();

    this.compose(
      useObservable(() =>
        combineLatest([this.name.valueChanges, this.address.valueChanges])
      )
    );
  }
}
