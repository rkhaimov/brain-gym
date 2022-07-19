import { Component } from '@angular/core';
import { CartService } from '../cart.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
  form = this.builder.group({
    name: '',
    address: '',
  });

  constructor(public cart: CartService, private builder: FormBuilder) {}

  onSubmit() {
    console.log(this.form.value);
    this.cart.clear();
    this.form.reset();
  }
}
