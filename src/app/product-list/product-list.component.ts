import { Component } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent {
  constructor(public product: ProductService) {}

  share() {
    window.alert('The product has been shared!');
  }
}
