import { InjectionToken } from '@angular/core';
import { Product } from '../globals/product.service';

const repositories = {
  getAllShipping: () =>
    fetch('/assets/shipping.json').then(
      (response) => response.json() as unknown as Shipping[]
    ),
  getAllProducts: () =>
    fetch('/assets/products.json').then(
      (response) => response.json() as unknown as Product[]
    ),
};

export const API = {
  provide: new InjectionToken('API_STRUCT'),
  useValue: repositories,
};

export type Api = typeof repositories;

export type Shipping = {
  type: string;
  price: number;
};
