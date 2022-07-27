import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartComponent } from './cart.component';
import { config } from './pure-config';

@NgModule({
  ...config,
  imports: [
    ...config.imports,
    RouterModule.forChild([{ path: '', component: CartComponent }]),
  ],
})
export class CartModule {}
