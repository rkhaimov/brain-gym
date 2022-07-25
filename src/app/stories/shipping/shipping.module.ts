import { NgModule } from '@angular/core';
import { ShippingComponent } from './shipping.component';
import { ProjectionComponent } from './projection/projection.component';
import { ReusablesModule } from '../../reusables/reusables.module';
import { RouterModule } from '@angular/router';
import { GuardDirective } from './guard.directive';

@NgModule({
  imports: [
    ReusablesModule,
    RouterModule.forChild([{ path: '', component: ShippingComponent }]),
  ],
  declarations: [ShippingComponent, ProjectionComponent, GuardDirective],
})
export class ShippingModule {}
