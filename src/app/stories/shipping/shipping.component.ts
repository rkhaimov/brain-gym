import { Component, Input } from '@angular/core';
import { CartService } from '../../globals/cart.service';
import { ProjectionChildProps } from './projection/projection.component';
import { concatMap, from, map, timer } from 'rxjs';
import { ShippingService } from './shipping.service';

@Component({
  providers: [ShippingService],
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
})
export class ShippingComponent {
  child = ProjectionChildComponent;

  nullable: string | null | undefined = 'nullable';

  numbers$ = from([1, 2, 3]).pipe(
    concatMap((n) => timer(3_000).pipe(map(() => n)))
  );

  constructor(public cart: CartService, private shipping: ShippingService) {}
}

@Component({
  template: '<h3>Hello world {{ data }}</h3>',
})
class ProjectionChildComponent implements ProjectionChildProps {
  @Input() data!: string;
}
