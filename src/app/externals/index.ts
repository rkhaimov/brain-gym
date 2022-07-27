import { InjectionToken } from '@angular/core';

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

export function createMockApi(overrides?: Partial<Api>) {
  return {
    provide: API.provide,
    useValue: overrides,
  };
}

export type Api = typeof repositories;

export type Shipping = {
  type: string;
  price: number;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
};
