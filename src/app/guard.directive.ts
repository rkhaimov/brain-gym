import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { useChangesEffect } from './reusables/useChangesEffect';
import { scan } from 'rxjs';
import { ComposableComponent } from './reusables/ComposableComponent';

@Directive({ selector: '[guard]' })
export class GuardDirective<T> extends ComposableComponent {
  @Input() guard!: T;

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
        'guard'
      )
    );
  }
}
