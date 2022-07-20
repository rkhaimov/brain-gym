import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../product.service';

@Component({
  selector: 'app-product-alerts',
  templateUrl: './product-alerts.component.html',
})
export class ProductAlertsComponent {
  @Input() product!: Product;
  @Output() notify = new EventEmitter<void>();
}
