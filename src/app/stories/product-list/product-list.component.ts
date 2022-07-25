import { Component } from '@angular/core';
import { ProductService } from '../../globals/product.service';
import { ComposableComponent } from '../../reusables/utils/ComposableComponent';
import { delay, from, switchMap, tap } from 'rxjs';
import { useObservable } from '../../reusables/utils/useObservable';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent extends ComposableComponent {
  constructor(public product: ProductService) {
    super();

    this.compose(
      useObservable(() =>
        from(fetch('/assets/products.json')).pipe(
          delay(5_000),
          switchMap((response) => response.json()),
          tap(console.log)
        )
      )
    );
  }

  share() {
    window.alert('The product has been shared!');
  }
}
