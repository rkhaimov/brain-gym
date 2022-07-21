import { Component, Input } from '@angular/core';
import { CartService } from '../cart.service';
import { ProjectionChildProps } from '../projection/projection.component';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
})
export class ShippingComponent {
  child = ProjectionChildComponent;

  constructor(public cart: CartService) {}
}

@Component({
  template: '<h3>Hello world {{ data }}</h3>',
})
class ProjectionChildComponent implements ProjectionChildProps {
  @Input() data!: string;
}
