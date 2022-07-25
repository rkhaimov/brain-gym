import {
  AfterViewInit,
  Component,
  Input,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ComposableComponent } from '../../../reusables/utils/ComposableComponent';

export interface ProjectionChildProps {
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
  @Input() children!: Type<ProjectionChildProps>;
  @ViewChild('content', { read: ViewContainerRef }) content?: ViewContainerRef;

  ngAfterViewInit() {
    if (this.content) {
      const child = this.content.createComponent<ProjectionChildProps>(
        this.children
      );

      child.instance.data = 'This is a Secret!';
      child.changeDetectorRef.detectChanges();
    }
  }
}
