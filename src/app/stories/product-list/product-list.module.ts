import { NgModule } from '@angular/core';
import { ReusablesModule } from '../../reusables/reusables.module';
import { ProductListComponent } from './product-list.component';
import { RouterModule } from '@angular/router';
import { CountdownComponent } from './countdown/countdown.component';
import { ProductAlertsComponent } from './product-alerts/product-alerts.component';

@NgModule({
  imports: [
    ReusablesModule,
    RouterModule.forChild([{ path: '', component: ProductListComponent }]),
  ],
  declarations: [
    ProductListComponent,
    CountdownComponent,
    ProductAlertsComponent,
  ],
})
export class ProductListModule {}
