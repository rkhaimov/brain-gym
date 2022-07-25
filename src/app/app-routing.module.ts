import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ShippingModule } from './stories/shipping/shipping.module';
import { ProductListModule } from './stories/product-list/product-list.module';
import { CartModule } from './stories/cart/cart.module';
import { ProductDetailsModule } from './stories/product-details/product-details.module';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', loadChildren: () => Promise.resolve(ProductListModule) },
      {
        path: 'products/:productId',
        loadChildren: () => Promise.resolve(ProductDetailsModule),
      },
      { path: 'cart', loadChildren: () => Promise.resolve(CartModule) },
      { path: 'shipping', loadChildren: () => Promise.resolve(ShippingModule) },
    ]),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
