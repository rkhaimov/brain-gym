import { Component } from '@angular/core';
import { Product, products } from '../products';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent {
  constructor(private route: ActivatedRoute, public cart: CartService) {}

  get product$(): Observable<Product> {
    return this.route.params.pipe(
      map((params) =>
        products.find(
          (product) => product.id === parseInt(params['productId'], 10)
        )
      ),
      filter((product): product is Product => product !== undefined)
    );
  }
}
