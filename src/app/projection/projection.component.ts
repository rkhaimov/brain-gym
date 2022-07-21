import { Component } from '@angular/core';
import { ComposableComponent } from '../reusables/ComposableComponent';

@Component({
  selector: 'app-projection',
  template: `
    <ng-template #estimateT>
      <div>Approximately {{ estimate }} lessons ...</div>
    </ng-template>

    <div style="background-color: red">
      <ng-container *ngTemplateOutlet="estimateT"></ng-container>
    </div>
  `,
})
export class ProjectionComponent extends ComposableComponent {
  estimate = 10;
}
