import { Component, Input, TemplateRef } from '@angular/core';
import { ComposableComponent } from '../reusables/ComposableComponent';

@Component({
  selector: 'app-projection',
  template: `
    <ng-template #defaultTabButtons>
      <div class="default-tab-buttons">...</div>
    </ng-template>
    <ng-container
      [ngTemplateOutlet]="headerTemplate ? headerTemplate : defaultTabButtons"
      [ngTemplateOutletContext]="{ $implicit: secret }"
    ></ng-container>
  `,
})
export class ProjectionComponent extends ComposableComponent {
  @Input() headerTemplate?: TemplateRef<string>;

  secret = 'It is a secret!';
}
