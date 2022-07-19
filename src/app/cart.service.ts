import { Injectable } from '@angular/core';
import { Product } from './products';
import {
  BehaviorSubject,
  defer,
  identity,
  Observable,
  scan,
  startWith,
  Subject,
} from 'rxjs';

type Shipping = {
  type: string;
  price: number;
};

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private storage = createStorage<Product[]>([]);

  constructor() {}

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

type Storage<TState> = {
  actions: Subject<(state: TState) => TState>;
  state$: Observable<TState>;
};

function createStorage<TState>(initial: TState): Storage<TState> {
  const actions: Storage<TState>['actions'] = new Subject();
  const state$ = new BehaviorSubject<TState>(initial);

  actions
    .pipe(
      startWith(identity),
      scan((state, action) => action(state), initial)
    )
    .subscribe(state$);

  return {
    state$: state$.asObservable(),
    actions,
  };
}
