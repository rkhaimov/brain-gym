import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, map } from 'rxjs';
import { CartService } from '../../globals/cart.service';
import { ProductService } from '../../globals/product.service';
import { Product } from '../../externals';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent {
  date = new Date(1996, 5, 15);
  product$ = combineLatest([this.route.params, this.product.products$]).pipe(
    map(([params, products]) =>
      products.find(
        (product) => product.id === parseInt(params['productId'], 10)
      )
    ),
    filter((product): product is Product => product !== undefined)
  );

  constructor(
    private route: ActivatedRoute,
    public cart: CartService,
    private product: ProductService
  ) {}
}
