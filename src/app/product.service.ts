import { Injectable, OnInit } from '@angular/core';
import { createStorage } from './createStorage';

export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private storage = createStorage<Product[]>([]);

  get products$() {
    return this.storage.state$;
  }

  constructor() {
    void fetch('/assets/products.json')
      .then((response) => response.json() as unknown as Product[])
      .then((products) => this.storage.actions.next(() => products));
  }
}
