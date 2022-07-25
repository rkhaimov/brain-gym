import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../globals/product.service';
import { ComposableComponent } from '../../../reusables/utils/ComposableComponent';

@Component({
  selector: 'app-product-alerts',
  templateUrl: './product-alerts.component.html',
})
export class ProductAlertsComponent extends ComposableComponent {
  @Input() product!: Product;
  @Output() notify = new EventEmitter<void>();
}
