import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { createStorage } from './reusables/createStorage';
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

  products$ = this.storage.state$;

  shipping$ = defer(() =>
    fetch('/assets/shipping.json').then(
      (response) => response.json() as unknown as Shipping[]
    )
  );

  add(product: Product): void {
    this.storage.update((products) => [...products, product]);
  }

  clear(): void {
    this.storage.update(() => []);
  }
}
