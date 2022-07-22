import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { useChangesEffect } from './reusables/useChangesEffect';
import { tap } from 'rxjs';
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
            tap(([nullable]) =>
              nullable
                ? this.view.createEmbeddedView(this.template)
                : this.view.clear()
            )
          ),
        this,
        ['guard']
      )
    );
  }

  static ngTemplateGuard_guard<T>(
    dir: GuardDirective<T>,
    state: T | null | undefined
  ): state is NonNullable<T> {
    return true;
  }
}
