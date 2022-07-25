import { Inject, Injectable } from '@angular/core';
import { createStorage } from '../reusables/utils/createStorage';
import { Api, API } from '../externals';
import { ComposableService } from '../reusables/utils/ComposableService';
import { useObservable } from '../reusables/utils/useObservable';
import { from } from 'rxjs';

export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
};

@Injectable()
export class ProductService extends ComposableService {
  private storage = createStorage<Product[]>([]);

  products$ = this.storage.state$;

  constructor(@Inject(API.provide) private api: Api) {
    super();

    this.compose(
      useObservable(() =>
        from(
          this.api
            .getAllProducts()
            .then((products) => this.storage.update(() => products))
        )
      )
    );
  }
}
