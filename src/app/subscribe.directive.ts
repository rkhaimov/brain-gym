import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { ComposableComponent } from './reusables/ComposableComponent';
import { useChangesEffect } from './reusables/useChangesEffect';

@Directive({
  selector: '[subscribe]',
})
export class SubscribeDirective<T> extends ComposableComponent {
  @Input() subscribeOf!: Observable<T>;
  @Input() subscribeElse!: TemplateRef<void>;

  constructor(
    private view: ViewContainerRef,
    private template: TemplateRef<Context<T>>
  ) {
    super();

    this.compose(
      useChangesEffect(
        (changes$) =>
          changes$.pipe(
            switchMap(([value$]) => value$),
            tap((value) => {
              this.view.remove();
              this.view.createEmbeddedView(this.template, {
                $implicit: value,
                hello: false,
              });
            })
          ),
        this,
        ['subscribeOf']
      ),
      useChangesEffect(
        (changes$) =>
          changes$.pipe(
            tap(([ref]) => {
              this.view.remove();
              this.view.createEmbeddedView(ref);
            })
          ),
        this,
        ['subscribeElse']
      )
    );
  }

  static ngTemplateContextGuard<T>(
    directive: SubscribeDirective<T>,
    context: Context<T>
  ): context is Context<T> {
    return true;
  }
}

type Context<T> = { $implicit: T; hello: boolean };
