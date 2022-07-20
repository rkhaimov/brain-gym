import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../product.service';
import { ComposableComponent } from '../reusables/ComposableComponent';
import { useChangesEffect } from '../reusables/useChangesEffect';

@Component({
  selector: 'app-product-alerts',
  templateUrl: './product-alerts.component.html',
})
export class ProductAlertsComponent extends ComposableComponent {
  @Input() product!: Product;
  @Output() notify = new EventEmitter<void>();

  constructor() {
    super();

    this.compose(useChangesEffect((changes$) => changes$, this, 'product'));
  }
}
