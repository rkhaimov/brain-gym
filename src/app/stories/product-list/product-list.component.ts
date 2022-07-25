import { Component, Inject } from '@angular/core';
import { ProductService } from '../../globals/product.service';
import { ComposableComponent } from '../../reusables/utils/ComposableComponent';
import { delay, from, tap } from 'rxjs';
import { useObservable } from '../../reusables/utils/useObservable';
import { Api, API } from '../../externals';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent extends ComposableComponent {
  constructor(
    public product: ProductService,
    @Inject(API.provide) private api: Api
  ) {
    super();

    this.compose(
      useObservable(() =>
        from(api.getAllProducts()).pipe(delay(5_000), tap(console.log))
      )
    );
  }

  share() {
    window.alert('The product has been shared!');
  }
}
