import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ComposableComponent } from '../reusables/ComposableComponent';

export interface ChildComponent {
  data: string;
}

@Component({
  selector: 'app-projection',
  template: `
    <div>
      <h1>Here is yours dynamic component</h1>
      <ng-template #content></ng-template>
    </div>
  `,
})
export class ProjectionComponent
  extends ComposableComponent
  implements AfterViewInit
{
  @ViewChild('content') content!: TemplateRef<unknown>;

  ngAfterViewInit() {
    console.log(this.content);
  }
}
