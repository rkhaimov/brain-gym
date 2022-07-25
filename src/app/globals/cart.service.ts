import { Inject, Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { createStorage } from '../reusables/utils/createStorage';
import { Product } from './product.service';
import { Api, API } from '../externals';

@Injectable()
export class CartService {
  private storage = createStorage<Product[]>([]);

  constructor(@Inject(API.provide) private api: Api) {}

  shipping$ = defer(() => this.api.getAllShipping());
  products$ = this.storage.state$;

  add(product: Product): void {
    this.storage.update((products) => [...products, product]);
  }

  clear(): void {
    this.storage.update(() => []);
  }
}
