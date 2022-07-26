import { Inject, Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { createStorage } from '../reusables/utils/createStorage';
import { Product } from './product.service';
import { Api, API } from '../externals';

@Injectable()
export class CartService {
  shipping$ = defer(() => this.api.getAllShipping());
  private storage = createStorage<Product[]>([]);
  products$ = this.storage.state$;

  constructor(@Inject(API.provide) private api: Api) {}

  add(product: Product): void {
    this.storage.update((products) => [...products, product]);
  }

  clear(): void {
    this.storage.update(() => []);
  }
}
