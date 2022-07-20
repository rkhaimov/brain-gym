import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { createStorage } from './createStorage';
import { Product } from './product.service';

type Shipping = {
  type: string;
  price: number;
};

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private storage = createStorage<Product[]>([]);

  get products$() {
    return this.storage.state$;
  }

  shipping$ = defer(() =>
    fetch('/assets/shipping.json').then(
      (response) => response.json() as unknown as Shipping[]
    )
  );

  add(product: Product): void {
    this.storage.actions.next((products) => [...products, product]);
  }

  clear(): void {
    this.storage.actions.next(() => []);
  }
}
