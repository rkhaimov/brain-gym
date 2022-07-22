import { Injectable } from '@angular/core';
import { createStorage } from './reusables/createStorage';

export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private storage = createStorage<Product[]>([]);

  products$ = this.storage.state$;

  constructor() {
    void fetch('/assets/products.json')
      .then((response) => response.json() as unknown as Product[])
      .then((products) => this.storage.update(() => products));
  }
}
