import { Component } from '@angular/core';
import { ComposableComponent } from '../reusables/ComposableComponent';

@Component({
  selector: 'app-projection',
  template: `
    <h2>Single-slot content projection</h2>
    <ng-content></ng-content>
  `,
})
export class ProjectionComponent extends ComposableComponent {

}
