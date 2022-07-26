import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComposableComponent } from '../../../reusables/utils/ComposableComponent';
import { Product } from '../../../externals';

@Component({
  selector: 'app-product-alerts',
  templateUrl: './product-alerts.component.html',
})
export class ProductAlertsComponent extends ComposableComponent {
  @Input() product!: Product;
  @Output() notify = new EventEmitter<void>();
}
