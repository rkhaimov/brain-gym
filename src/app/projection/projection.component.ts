import { Component } from '@angular/core';
import { ComposableComponent } from '../reusables/ComposableComponent';

@Component({
  selector: 'app-projection',
  template: `
    <h2>Single-slot content projection</h2>
    <h2>Multi-slot content projection</h2>

    Default:
    <ng-content></ng-content>

    Question:
    <ng-content select="[question]"></ng-content>
  `,
})
export class ProjectionComponent extends ComposableComponent {

}
