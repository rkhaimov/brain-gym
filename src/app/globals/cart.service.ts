import {
  FactoryProvider,
  Inject,
  Injectable,
  Provider,
  ValueProvider,
} from '@angular/core';
import { defer } from 'rxjs';
import { createStorage } from '../reusables/utils/createStorage';
import { Api, API, Product } from '../externals';

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

export function arrangeCartService(
  arrange: (cart: CartService) => void,
  deps: { api: ValueProvider }
): FactoryProvider {
  return {
    provide: CartService,
    useFactory: (api: Api) => {
      const cart = new CartService(api);

      arrange(cart);

      return cart;
    },
    deps: [Object.values(deps).map((provider) => provider.provide)],
  };
}
