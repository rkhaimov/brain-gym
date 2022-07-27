import { NgModule } from '@angular/core';
import { ShippingContainer } from './shipping.component';
import { RouterModule } from '@angular/router';
import { config } from './pure-config';

@NgModule({
  ...config,
  imports: [
    ...config.imports,
    RouterModule.forChild([{ path: '', component: ShippingContainer }]),
  ],
})
export class ShippingModule {}
