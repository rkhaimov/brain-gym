import { Component } from '@angular/core';
import { CartService } from '../cart.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent {
  fz = 16;

  form = this.builder.group({
    name: this.builder.nonNullable.control(''),
    address: this.builder.nonNullable.control(''),
  });

  constructor(public cart: CartService, private builder: FormBuilder) {}

  onSubmit() {
    this.cart.clear();
    this.form.reset();
  }
}
