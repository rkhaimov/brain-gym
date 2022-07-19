import { Component } from '@angular/core';
import { Product, products } from '../products';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent {
  constructor(private route: ActivatedRoute) {}

  get product$(): Observable<Product> {
    return this.route.params.pipe(
      map(
        (params) =>
          products.find(
            (product) => product.id === parseInt(params['productId'], 10)
          ) as Product
      )
    );
  }
}
