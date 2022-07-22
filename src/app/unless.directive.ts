import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ComposableComponent } from './reusables/ComposableComponent';
import { useChangesEffect } from './reusables/useChangesEffect';
import { tap } from 'rxjs';

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
            tap((condition) =>
              condition
                ? this.view.clear()
                : this.view.createEmbeddedView(this.template)
            )
          ),
        this,
        ['appUnless']
      )
    );
  }
}
