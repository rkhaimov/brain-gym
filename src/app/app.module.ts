import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductAlertsComponent } from './product-alerts/product-alerts.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { ShippingComponent } from './shipping/shipping.component';
import { ChangesComponent } from './changes/changes.component';
import { CountdownComponent } from './countdown/countdown.component';
import { ProjectionComponent } from './projection/projection.component';
import { SizerComponent } from './sizer/sizer.component';
import { MyPipe } from './my.pipe';
import { HighlightDirective } from './highlight.directive';
import { UnlessDirective } from './unless.directive';
import { SubscribeDirective } from './subscribe.directive';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: ProductListComponent },
      {
        path: 'products/:productId',
        component: ProductDetailsComponent,
      },
      { path: 'cart', component: CartComponent },
      { path: 'shipping', component: ShippingComponent },
    ]),
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    ProductListComponent,
    ProductAlertsComponent,
    ProductDetailsComponent,
    CartComponent,
    ShippingComponent,
    ChangesComponent,
    CountdownComponent,
    ProjectionComponent,
    SizerComponent,
    MyPipe,
    HighlightDirective,
    UnlessDirective,
    SubscribeDirective,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
