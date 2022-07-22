import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ComposableComponent } from './reusables/ComposableComponent';
import { useChangesEffect } from './reusables/useChangesEffect';
import { scan } from 'rxjs';

@Directive({
  selector: '[appUnless]',
})
export class UnlessDirective extends ComposableComponent {
  @Input() appUnless!: boolean;

  constructor(
    private template: TemplateRef<void>,
    private view: ViewContainerRef
  ) {
    super();

    this.compose(
      useChangesEffect(
        (changes$) =>
          changes$.pipe(
            scan((placed, condition) => {
              if (condition) {
                this.view.clear();

                return false;
              }

              this.view.createEmbeddedView(this.template);

              return true;
            }, false)
          ),
        this,
        'appUnless'
      )
    );
  }
}
