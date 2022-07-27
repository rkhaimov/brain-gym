import { Component } from '@angular/core';
import { CartService } from '../../globals/cart.service';
import { ShippingService } from './shipping.service';
import { ProjectionChildComponent } from './projection-child.component';

@Component({
  providers: [ShippingService],
  template: '<app-shipping></app-shipping>',
})
export class ShippingContainer {}

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
})
export class ShippingComponent {
  child = ProjectionChildComponent;

  nullable: string | null | undefined = 'nullable';

  constructor(public cart: CartService, private shipping: ShippingService) {}
}
