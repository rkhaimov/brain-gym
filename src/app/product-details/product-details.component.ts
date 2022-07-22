import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, map } from 'rxjs';
import { CartService } from '../cart.service';
import { Product, ProductService } from '../product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent {
  constructor(
    private route: ActivatedRoute,
    public cart: CartService,
    private product: ProductService
  ) {}

  product$ = combineLatest([this.route.params, this.product.products$]).pipe(
    map(([params, products]) =>
      products.find(
        (product) => product.id === parseInt(params['productId'], 10)
      )
    ),
    filter((product): product is Product => product !== undefined)
  );
}
